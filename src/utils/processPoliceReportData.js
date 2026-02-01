// src/utils/processPoliceReportData.js
import { XMLParser } from 'fast-xml-parser';

/**
 * Yeni Polis Raporu (POLICE_REPORT2) XML dosyasını okur.
 */
export const parsePoliceReportXML = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("Yüklenecek bir dosya seçilmedi."));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const xmlString = e.target.result;
                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "@"
                });
                const json = parser.parse(xmlString);

                if (!json?.POLICE_REPORT2) {
                    throw new Error("Geçersiz format! Lütfen POLICE_REPORT2 XML dosyasını yükleyin.");
                }

                resolve(json);
            } catch (error) {
                reject(new Error("XML Ayrıştırma Hatası: " + error.message));
            }
        };
        reader.readAsText(file);
    });
};

const formatNameSurname = (name) => {
    if (typeof name !== 'string' || name.length === 0) return '';
    return name.trim().split(/\s+/).map(word => {
        if (word.length === 0) return '';
        return word[0].toUpperCase() + word.substring(1).toLowerCase();
    }).join(' ');
};

/**
 * Verileri işler ve sadece RESV_STATUS === 'CKIN' olanları alır.
 */
export const transformPoliceReportData = (rawData) => {
    let transformedRecords = [];

    try {
        const nationalities = rawData.POLICE_REPORT2.LIST_G_NATIONALITY?.G_NATIONALITY || [];
        const nationalitiesArray = Array.isArray(nationalities) ? nationalities : [nationalities];

        nationalitiesArray.forEach(nat => {
            const guests = nat.LIST_G_FIRST?.G_FIRST || [];
            const guestsArray = Array.isArray(guests) ? guests : [guests];
            
            guestsArray.forEach(g => {
                // KRİTİK FİLTRE: Sadece CKIN (Check-In) durumundaki misafirleri al
                if (g.RESV_STATUS === 'CKIN') {
                    
                    const cin = g.TO_CHAR_RGV_TRUNC_ARRIVAL_PMS_;
                    const cout = g.TO_CHAR_RGV_TRUNC_DEPARTURE_PM;

                    // Tarihleri kontrol et (Aynı gün giriş-çıkış değilse devam et)
                    if (cin && cout && cin !== cout) {
                        
                        // ID Bilgilerini Güvenli Çekme
                        const qIdData = g.LIST_Q_ID?.Q_ID;
                        const idNumber = Array.isArray(qIdData) ? qIdData[0]?.ID_NUMBER : qIdData?.ID_NUMBER;
                        const idType = Array.isArray(qIdData) ? qIdData[0]?.ID_TYPE : qIdData?.ID_TYPE;

                        transformedRecords.push({
                            roomNo: String(g.ROOM || '').trim(),
                            firstName: formatNameSurname(String(g.FIRST || '')),
                            lastName: formatNameSurname(String(g.LAST || '')),
                            belgeNo: String(idNumber || '').toLowerCase().trim(),
                            birthDate: String(g.BIRTH_DATE || ''),
                            uyruk: String(g.GUEST_COUNTRY || ''),
                            belgeTuru: String(idType || ''),
                            ikametAdresi: String(g.COUNTRY_DESCRIPTION || '').trim(),
                            cin: String(cin),
                            cout: String(cout)
                        });
                    }
                }
            });
        });

    } catch (error) {
        console.error("Dönüştürme hatası:", error);
        throw new Error("Veri işleme sırasında bir hata oluştu.");
    }

    return transformedRecords;
};