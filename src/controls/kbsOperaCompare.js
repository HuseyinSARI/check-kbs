// src/utils/kbsOperaCompare.js
// Bu dosya, KBS ve Polis Raporu (OPERA) verilerini karşılaştırmak için kullanılır.

/**
 * Oda numaralarını ve belge numaralarını karşılaştırma için normalleştirir.
 * Boşlukları kaldırır ve küçük harfe çevirir.
 * @param {string|number} value - Normalleştirilecek değer.
 * @returns {string} - Normalleştirilmiş değer.
 */
const normalizeValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\s/g, '').toLowerCase();
};

/**
 * KBS ve Polis Raporu verilerini karşılaştırır ve uyumsuzlukları tespit eder.
 *
 * @param {Array<Object>} kbsData - İşlenmiş KBS verisi.
 * @param {Array<Object>} policeReportData - İşlenmiş Polis Raporu (OPERA) verisi.
 * @returns {Object} - Oda numaralarına göre gruplandırılmış hata objeleri.
 * Örn: { "502": [{ type: "KBS_MISMATCH", kbsGuest: {...}, operaGuest: {...} }, ...], ... }
 */
export const compareKBSAndPoliceReportData = (kbsData, policeReportData) => {
    const kbsErrors = {};

    // Her iki veri kümesini de belge numaralarına göre hızlı erişim için haritala
    const kbsMap = new Map(); // key: normalizedBelgeNo, value: Array<guest>
    const operaMap = new Map(); // key: normalizedBelgeNo, value: Array<guest>

    // KBS verisini haritala
    kbsData.forEach(guest => {
        const normalizedBelgeNo = normalizeValue(guest.belgeNo);
        if (!kbsMap.has(normalizedBelgeNo)) {
            kbsMap.set(normalizedBelgeNo, []);
        }
        kbsMap.get(normalizedBelgeNo).push(guest);
    });

    // OPERA verisini haritala
    policeReportData.forEach(guest => {
        const normalizedBelgeNo = normalizeValue(guest.belgeNo);
        if (!operaMap.has(normalizedBelgeNo)) {
            operaMap.set(normalizedBelgeNo, []);
        }
        operaMap.get(normalizedBelgeNo).push(guest);
    });

    // --- KBS'den OPERA'ya Doğrulama (KBS'de olup OPERA'da olmayan veya uyumsuz olanlar) ---
    kbsData.forEach(kbsGuest => {
        const normalizedKBSBelgeNo = normalizeValue(kbsGuest.belgeNo);
        const normalizedKBSOdaNo = normalizeValue(kbsGuest.odaNo);

        // Belge numarasına göre OPERA'da eşleşenleri bul
        const matchingOperaGuests = operaMap.get(normalizedKBSBelgeNo) || [];

        let foundMatchInOpera = false;
        for (const operaGuest of matchingOperaGuests) {
            const normalizedOperaOdaNo = normalizeValue(operaGuest.roomNo);

            // Hem belge no hem de oda no eşleşiyor mu?
            if (normalizedKBSOdaNo === normalizedOperaOdaNo) {
                // Ad ve soyad karşılaştırması (normalleştirilmiş halleriyle)
                const normalizedKBSAdSoyad = `${normalizeValue(kbsGuest.ad)} ${normalizeValue(kbsGuest.soyad)}`;
                const normalizedOperaAdSoyad = `${normalizeValue(operaGuest.firstName)} ${normalizeValue(operaGuest.lastName)}`;

                if (normalizedKBSAdSoyad === normalizedOperaAdSoyad) {
                    foundMatchInOpera = true;
                    // Tamamen uyumlu, hata yok
                    break;
                } else {
                    // Belge No ve Oda No eşleşiyor ama Ad/Soyad uyumsuz
                    if (!kbsErrors[normalizedKBSOdaNo]) {
                        kbsErrors[normalizedKBSOdaNo] = [];
                    }
                    
                    // Ad/Soyad uyumsuzluğunu iki ayrı hata olarak ekle
                    // 1. KBS'deki misafiri, sanki OPERA'da yokmuş gibi ekle
                    kbsErrors[normalizedKBSOdaNo].push({
                        type: 'KBS_MISSING_IN_OPERA', // Mevcut "KBS'de eksik" tipini kullanabiliriz
                        message: `Ad/Soyad Uyumsuz (KBS Tarafı Eksik): KBS: '${kbsGuest.ad} ${kbsGuest.soyad}', Belge No: '${kbsGuest.belgeNo}'`,
                        kbsGuest: kbsGuest,
                        operaGuest: null, // OPERA tarafı boş kalsın
                        source: 'KBS' 
                    });

                    // 2. OPERA'daki misafiri, sanki KBS'de yokmuş gibi ekle
                    kbsErrors[normalizedKBSOdaNo].push({
                        type: 'OPERA_MISSING_IN_KBS', // Mevcut "OPERA'da eksik" tipini kullanabiliriz
                        message: `Ad/Soyad Uyumsuz (OPERA Tarafı Eksik): OPERA: '${operaGuest.firstName} ${operaGuest.lastName}', Belge No: '${operaGuest.belgeNo}'`,
                        kbsGuest: null, // KBS tarafı boş kalsın
                        operaGuest: { 
                            ad: operaGuest.firstName, 
                            soyad: operaGuest.lastName, 
                            belgeNo: operaGuest.belgeNo, 
                            odaNo: operaGuest.roomNo 
                        }, 
                        source: 'OPERA' 
                    });

                    foundMatchInOpera = true; // Uyumsuz olsa da bir eşleşme bulundu
                    break; // Sadece bir eşleşen bulmak yeterli
                }
            }
        }

        if (!foundMatchInOpera) {
            // KBS'de var ama OPERA'da ilgili belge numarası veya oda numarasında eşleşme yok
            if (!kbsErrors[normalizedKBSOdaNo]) {
                kbsErrors[normalizedKBSOdaNo] = [];
            }
            kbsErrors[normalizedKBSOdaNo].push({
                type: 'KBS_MISSING_IN_OPERA',
                message: `KBS Kaydı OPERA'da Eksik: Ad: '${kbsGuest.ad}', Soyad: '${kbsGuest.soyad}', Belge No: '${kbsGuest.belgeNo}'`,
                kbsGuest: kbsGuest,
                operaGuest: null, // OPERA tarafında eşleşme yok
                source: 'KBS' // Hata KBS'den kaynaklanıyor
            });
        }
    });

    // --- OPERA'dan KBS'ye Doğrulama (OPERA'da olup KBS'de olmayanlar) ---
    // NOT: Ad/Soyad uyumsuzlukları (NAME_MISMATCH) yukarıdaki KBS döngüsünde zaten iki ayrı hata olarak işlendiği için
    // burada tekrar belgeNo ve odaNo eşleşenleri kontrol edip 'NAME_MISMATCH' hatası eklemeye gerek yoktur.
    // Burada sadece OPERA'da olup KBS'de olmayanları kontrol edeceğiz.
    policeReportData.forEach(operaGuest => {
        const normalizedOperaBelgeNo = normalizeValue(operaGuest.belgeNo);
        const normalizedOperaOdaNo = normalizeValue(operaGuest.roomNo);

        const matchingKBSGuests = kbsMap.get(normalizedOperaBelgeNo) || [];
        
        // Bu OPERA kaydının KBS'de belgeNo ve odaNo olarak tam bir eşleşmesi var mı?
        // Ve bu eşleşen kaydın ad/soyadı da uyumlu mu?
        const isFullyMatchedInKBS = matchingKBSGuests.some(kbsGuest => 
            normalizeValue(kbsGuest.odaNo) === normalizedOperaOdaNo &&
            normalizeValue(kbsGuest.ad) === normalizeValue(operaGuest.firstName) &&
            normalizeValue(kbsGuest.soyad) === normalizeValue(operaGuest.lastName)
        );

        // Eğer tam eşleşme yoksa (yani KBS'de hiç yoksa veya belge/oda no eşleşiyor ama ad/soyad farklıysa)
        // ad/soyad farklılığı yukarıda zaten ele alındığı için, burada sadece "tamamen eksik" durumuna bakıyoruz.
        if (!isFullyMatchedInKBS) {
            // Ayrıca, bu OPERA kaydının bir NAME_MISMATCH olarak zaten eklenip eklenmediğini kontrol etmeliyiz.
            // Yani, belge no ve oda no eşleşiyor ama ad/soyad farklı olduğu için yukarıda zaten ikiye ayrılmış mı?
            const isAlreadyHandledAsNameMismatch = matchingKBSGuests.some(kbsGuest =>
                normalizeValue(kbsGuest.odaNo) === normalizedOperaOdaNo &&
                (normalizeValue(kbsGuest.ad) !== normalizeValue(operaGuest.firstName) || 
                 normalizeValue(kbsGuest.soyad) !== normalizeValue(operaGuest.lastName))
            );

            if (!isAlreadyHandledAsNameMismatch) {
                if (!kbsErrors[normalizedOperaOdaNo]) {
                    kbsErrors[normalizedOperaOdaNo] = [];
                }
                
                // Mükerrer hata eklemeyi önlemek için kontrol et
                const isDuplicateMissing = kbsErrors[normalizedOperaOdaNo].some(error =>
                    error.type === 'OPERA_MISSING_IN_KBS' &&
                    normalizeValue(error.operaGuest.belgeNo) === normalizedOperaBelgeNo &&
                    // Sadece belge no aynı olanları kontrol etmiyoruz, çünkü ad/soyad uyumsuzluğunda da belge no aynı olabilir.
                    // Burada gerçekten sadece "KBS'de tamamen yok" durumu için kontrol yapmalıyız.
                    // Ad/soyad uyumsuzluğu için eklenen hatalar farklı 'type' veya 'source' ile eklenmeli.
                    error.kbsGuest === null // KBS tarafı boş olanlar (yani KBS'de eksik olanlar)
                );

                if (!isDuplicateMissing) {
                    kbsErrors[normalizedOperaOdaNo].push({
                        type: 'OPERA_MISSING_IN_KBS',
                        message: `OPERA Kaydı KBS'de Eksik: Ad: '${operaGuest.firstName}', Soyad: '${operaGuest.lastName}', Belge No: '${operaGuest.belgeNo}'`,
                        kbsGuest: null, 
                        operaGuest: { 
                            ad: operaGuest.firstName, 
                            soyad: operaGuest.lastName, 
                            belgeNo: operaGuest.belgeNo, 
                            odaNo: operaGuest.roomNo 
                        }, 
                        source: 'OPERA' 
                    });
                }
            }
        }
    });
    
    // Hataları oda numarasına göre sırala ve her odadaki hataları misafir adına göre sırala
    const sortedKbsErrors = {};
    Object.keys(kbsErrors).sort((a, b) => {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return a.localeCompare(b);
    }).forEach(roomNo => {
        // Her odadaki hata dizisini adına göre sırala
        sortedKbsErrors[roomNo] = kbsErrors[roomNo].sort((a, b) => {
            const nameA = a.kbsGuest ? normalizeValue(a.kbsGuest.ad) : normalizeValue(a.operaGuest ? a.operaGuest.ad : '');
            const nameB = b.kbsGuest ? normalizeValue(b.kbsGuest.ad) : normalizeValue(b.operaGuest ? b.operaGuest.ad : '');
            return nameA.localeCompare(nameB);
        });
    });

    return sortedKbsErrors;
};