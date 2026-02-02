// src/controls/kbsOperaCompare.js

/**
 * İsim içindeki BY, BYN, BAY, BAYAN gibi unvanları ve noktalama işaretlerini temizler.
 */
const cleanNameForMatch = (value) => {
    if (!value) return '';
    let str = String(value).toLocaleUpperCase('tr-TR').trim();
    // Sonda gelen unvanları temizle
    str = str.replace(/,?\s?(BYN|BY|BAYAN|BAY)$/g, '');
    // Noktalama ve boşlukları sil
    return str.replace(/[,./\s]/g, ''); 
};

/**
 * Görüntüleme için "Turkmen,Seydihan,BYN" -> "Seydihan Turkmen" formatına çevirir
 */
const formatRawName = (rawName) => {
    if (!rawName) return "";
    // Unvanları temizle
    let clean = rawName.replace(/,?\s?(BYN|BY|BAYAN|BAY)$/g, '');
    // Virgüllere göre parçala ve yer değiştir (Soyad, Ad -> Ad Soyad)
    let parts = clean.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        return `${parts[1]} ${parts[0]}`; // Ad Soyad
    }
    return parts[0];
};

export const compareKBSAndPoliceReportData = (kbsData, inhouseRawData) => {
    const errors = {};
    const flatInhouse = [];

    // 1. Inhouse Verisini Düzleştir
    inhouseRawData.forEach(row => {
        const roomNo = String(row.roomNo || row.ROOM).trim();
        const rawName = row.name || row.FULL_NAME || row.fullName;
        
        if (rawName) {
            flatInhouse.push({ 
                roomNo, 
                cleanName: cleanNameForMatch(rawName), 
                rawName: rawName 
            });
        }

        const accNames = row.accompanyNames || row.ACCOMPANYING_NAMES;
        if (accNames && typeof accNames === 'string') {
            accNames.split('/').forEach(name => {
                const trimmed = name.trim();
                if (trimmed) {
                    flatInhouse.push({ 
                        roomNo, 
                        cleanName: cleanNameForMatch(trimmed), 
                        rawName: trimmed 
                    });
                }
            });
        }
    });

    // 2. Karşılaştırma
    const rooms = new Set([...kbsData.map(d => String(d.odaNo)), ...flatInhouse.map(d => d.roomNo)]);

    rooms.forEach(roomNo => {
        const kList = kbsData.filter(d => String(d.odaNo) === roomNo);
        const iList = flatInhouse.filter(d => d.roomNo === roomNo);

        // KBS -> OPERA KONTROL
        kList.forEach(k => {
            const kFullName = cleanNameForMatch(k.ad + k.soyad);
            const kFullNameRev = cleanNameForMatch(k.soyad + k.ad);
            const match = iList.find(i => i.cleanName === kFullName || i.cleanName === kFullNameRev);
            
            if (!match) {
                if (!errors[roomNo]) errors[roomNo] = [];
                errors[roomNo].push({
                    type: 'KBS_MISSING_IN_OPERA',
                    message: `KBS'de var, Otelde eşleşmedi: ${k.ad} ${k.soyad}`,
                    kbsGuest: k, // Zaten ad, soyad, odaNo içeriyor
                    source: 'KBS'
                });
            }
        });

        // OPERA -> KBS KONTROL
        iList.forEach(i => {
            const match = kList.find(k => {
                const kFullName = cleanNameForMatch(k.ad + k.soyad);
                const kFullNameRev = cleanNameForMatch(k.soyad + k.ad);
                return i.cleanName === kFullName || i.cleanName === kFullNameRev;
            });

            if (!match) {
                if (!errors[roomNo]) errors[roomNo] = [];
                
                // Hata objesini senin istediğin formatta (Ad, Soyad, OdaNo ayrılmış şekilde) gönderiyoruz
                const formattedName = formatRawName(i.rawName);
                const nameParts = formattedName.split(' ');
                const displayAd = nameParts[0] || "";
                const displaySoyad = nameParts.slice(1).join(' ') || "";

                errors[roomNo].push({
                    type: 'OPERA_MISSING_IN_KBS',
                    message: `Otelde var, KBS'de yok: ${formattedName}`,
                    operaGuest: { 
                        ad: displayAd, 
                        soyad: displaySoyad,
                        odaNo: roomNo 
                    },
                    source: 'OPERA'
                });
            }
        });
    });

    return errors;
};