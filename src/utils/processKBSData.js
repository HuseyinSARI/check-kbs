// src/utils/processKBSData.js
import * as XLSX from 'xlsx';

/**
 * KBS XLSX dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * Dosyanın Excel dosyası olup olmadığını kontrol eder.
 * @param {File} file - Yüklenen KBS XLSX dosyası.
 * @returns {Promise<Array<Object>>} - Excel verisinin bir dizi obje halinde JSON hali.
 * @throws {Error} - Dosya okuma veya ayrıştırma hatası oluşursa.
 */
export const parseKBSXLSX = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("Yüklenecek bir dosya seçilmedi."));
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'xlsx') {
            reject(new Error(`Sadece Excel (.xlsx) dosyaları yüklenebilir. Yüklenen: ${file.name}`));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const json = XLSX.utils.sheet_to_json(worksheet);

                if (!json || json.length === 0) {
                    throw new Error("KBS dosyası boş veya okunamadı.");
                }

                resolve(json);
            } catch (error) {
                reject(new Error(error.message));
            }
        };
        reader.onerror = (error) => {
            reject(new Error(`"${file.name}" dosyası okuma hatası: ${error.target.error?.message || error.target.error || 'Bilinmeyen hata'}`));
        };
        reader.readAsArrayBuffer(file);
    });
};

/**
 * String'deki Türkçe karakterleri ve olası bozuk karakterleri İngilizce karşılıklarına çevirir.
 * @param {string} text - Düzeltilecek metin.
 * @returns {string} - Düzeltilmiş metin.
 */
const fixTurkishChars = (text) => {
    if (typeof text !== 'string') return text;
    let fixedText = text;

    // Önceki gibi bozuk karakter düzeltmeleri (eğer Excel'den hatalı geliyorsa)
    fixedText = fixedText
        .replace(/ý/g, 'ı') // 'small y with acute' to 'dotless i'
        .replace(/Ý/g, 'İ') // 'capital Y with acute' to 'capital I with dot'
        .replace(/þ/g, 'ş') // 'thorn' to 's with cedilla'
        .replace(/Þ/g, 'Ş') // 'capital Thorn' to 'capital S with cedilla'
        .replace(/ð/g, 'ğ') // 'eth' to 'g with breve'
        .replace(/Ð/g, 'Ğ') // 'capital Eth' to 'capital G with breve'
        .replace(/æ/g, 'ç') // 'ae' to 'c with cedilla'
        .replace(/Æ/g, 'Ç'); // 'capital AE' to 'capital C with cedilla'

    // Şimdi, Türkçe karakterleri İngilizce karşılıklarına çevirelim.
    // Bu, hem küçük hem büyük harfleri kapsar.
    fixedText = fixedText
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ı/g, 'i').replace(/İ/g, 'I') // 'ı' (dotless i) -> 'i', 'İ' (dotted I) -> 'I'
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U');

    return fixedText;
};


/**
 * İsimleri ve soyisimleri formatlar (ilk harf büyük, diğerleri küçük).
 * Bu formatlama işleminden önce Türkçe karakterler İngilizce'ye çevrilmiş olmalıdır.
 * @param {string} name - Formatlanacak isim veya soyisim.
 * @returns {string} - Formatlanmış metin.
 */
const formatNameSurname = (name) => {
    if (typeof name !== 'string' || name.length === 0) return '';
    return name.split(' ').map(word => {
        if (word.length === 0) return '';
        // toLocaleUpperCase ve toLocaleLowerCase kullanmaya gerek kalmıyor
        // çünkü karakterler zaten İngilizce'ye çevrildi.
        const firstChar = word.substring(0, 1).toUpperCase();
        const restOfWord = word.substring(1).toLowerCase();
        return firstChar + restOfWord;
    }).join(' ');
};


/**
 * Ham KBS verisinden işlenmiş veri dizisini oluşturur.
 * Bu fonksiyon, uygulamanın kullanabileceği belirli alanları ayıklayarak bir dizi döndürür.
 * @param {Array<Object>} rawData - Excel dosyasından okunan ham veri (her bir obje bir satırı temsil eder, anahtarlar başlıklar).
 * @returns {Array<Object>} - İstediğiniz alanları içeren işlenmiş veri objeleri dizisi.
 */
export const transformKBSData = (rawData) => {
    let transformedRecords = [];

    if (!rawData || rawData.length === 0) {
        console.warn("transformKBSData: Ham veri boş veya geçersiz.");
        return [];
    }

    const getValueOrEmptyString = (value) => {
        return value === null || value === undefined ? '' : value;
    };

    try {
        transformedRecords = rawData.map((row, rowIndex) => {
            const tcNoRaw = getValueOrEmptyString(row['T.C. No']);
            const belgeNoRaw = getValueOrEmptyString(row['Belge No']);

            const unifiedBelgeNo = tcNoRaw !== '' ? tcNoRaw.toString() : belgeNoRaw.toString();

            // Ad ve Soyad önce fixTurkishChars ile İngilizceye çevrilir, sonra formatlanır.
            const adRaw = getValueOrEmptyString(row['Adý']);
            const soyadRaw = getValueOrEmptyString(row['Soyadý']);

            const fixedAd = fixTurkishChars(adRaw);
            const fixedSoyad = fixTurkishChars(soyadRaw);

            const formattedAd = formatNameSurname(fixedAd);
            const formattedSoyad = formatNameSurname(fixedSoyad);

            // Diğer alanlar
            const odaNo = getValueOrEmptyString(row['Oda No']);

            return {
                belgeNo: unifiedBelgeNo,
                ad: formattedAd,
                soyad: formattedSoyad,
                odaNo: odaNo,
            };
        });

        transformedRecords.sort((a, b) => {
            const odaNoA = parseInt(a.odaNo, 10);
            const odaNoB = parseInt(b.odaNo, 10);

            // Sayısal olarak doğru sıralama için NaN durumlarını kontrol et
            if (isNaN(odaNoA) && isNaN(odaNoB)) return 0; // İkisi de sayı değilse sıralama değişmez
            if (isNaN(odaNoA)) return 1; // a sayı değilse b'den sonra gelsin
            if (isNaN(odaNoB)) return -1; // b sayı değilse a'dan sonra gelsin

            return odaNoA - odaNoB; // Oda numaralarına göre artan sırada sırala
        });

    } catch (error) {
        console.error("transformKBSData'da kritik hata oluştu:", error);
        throw new Error("KBS veri dönüşümü sırasında kritik bir hata oluştu: " + error.message);
    }

    return transformedRecords;
};