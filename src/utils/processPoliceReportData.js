// src/utils/processPoliceReportData.js
import { XMLParser } from 'fast-xml-parser';

/**
 * Polis Raporu (p2203) XML dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * Ayrıca dosyanın Polis Raporu XML yapısına uygun olup olmadığını kontrol eder.
 * @param {File} file - Yüklenen Polis Raporu XML dosyası.
 * @returns {Promise<Object>} - Ham XML verisinin JSON hali.
 * @throws {Error} - Dosya okuma, ayrıştırma veya Polis Raporu yapısı kontrolünde hata oluşursa.
 */
export const parsePoliceReportXML = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("Yüklenecek bir dosya seçilmedi."));
            return;
        }

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension !== 'xml') {
            reject(new Error(`Sadece XML dosyaları yüklenebilir. Yüklenen: ${file.name}`));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const xmlString = e.target.result;
                const options = {
                    ignoreAttributes: false,
                    attributeNamePrefix: "@",
                    textNodeName: "#text"
                };

                const parser = new XMLParser(options);
                const json = parser.parse(xmlString);

                if (!json?.P2203_POLISRAPORU?.LIST_G_VERILENODANO?.G_VERILENODANO)
                    if (!json?.PoliceReport?.Guests?.Guest) {
                        throw new Error(`Geçerli bir polis_raporu dosyası yükleyin`);
                    }

                resolve(json);
            } catch (error) {
                reject(new Error(error.message));
            }
        };
        reader.onerror = (error) => {
            reject(new Error(`"${file.name}" dosyası okuma hatası: ${error.target.error?.message || error.target.error || 'Bilinmeyen hata'}`));
        };
        reader.readAsText(file);
    });
};

/**
 * İsimleri ve soyisimleri formatlar (ilk harf büyük, diğerleri küçük).
 * İngilizce karakterlere göre formatlar.
 * @param {string} name - Formatlanacak isim veya soyisim.
 * @returns {string} - Formatlanmış metin.
 */
const formatNameSurname = (name) => {
    if (typeof name !== 'string' || name.length === 0) return '';
    return name.split(' ').map(word => {
        if (word.length === 0) return '';
        // İngilizce karakterler üzerinde çalışıldığı için toUpperCase/toLowerCase yeterli
        const firstChar = word.substring(0, 1).toUpperCase();
        const restOfWord = word.substring(1).toLowerCase();
        return firstChar + restOfWord;
    }).join(' ');
};



/**
 * Ham Polis Raporu XML verisinden işlenmiş veri dizisini oluşturur.
 * Bu fonksiyon, uygulamanın kullanabileceği belirli alanları ayıklayarak bir dizi döndürür.
 * @param {Object} rawData - Ham Polis Raporu XML verisinin JSON hali.
 * @returns {Array<Object>} - İstediğiniz alanları içeren işlenmiş veri objeleri dizisi.
 */
export const transformPoliceReportData = (rawData) => {
    let transformedRecords = [];

    try {
        // Polis Raporu XML'indeki misafir listesine erişim (yapıya göre ayarlanmalı)
        const guests = rawData?.P2203_POLISRAPORU?.LIST_G_VERILENODANO?.G_VERILENODANO || [];
        const guestsArray = Array.isArray(guests) ? guests : [guests]; // Tek kayıt varsa diziye çevir

        // Sadece cin ve cout tarihleri farklı olan kayıtları filtrele
        const filteredGuests = guestsArray.filter(room => {
            const cin = room.GELISTARIHI;
            const cout = room.AYRILISTARIHI;
            // 'cin' ve 'cout' tarihleri aynıysa bu kaydı hariç tut
            return cin && cout && cin !== cout;
        });

        transformedRecords = filteredGuests.map((room, index) => {
            // Helper function: Boş string yerine sadece null/undefined ise boş string atar, 0'ı korur.
            const getValueOrEmptyString = (value) => {
                return value === null || value === undefined ? '' : value;
            };

            const rawFirstName = getValueOrEmptyString(room.ADI);
            const rawLastName = getValueOrEmptyString(room.SOYADI);

            // İsim ve soyisimleri formatla
            const formattedFirstName = formatNameSurname(rawFirstName);
            const formattedLastName = formatNameSurname(rawLastName);

            const rawBelgeNo = getValueOrEmptyString(room.KIMLIKSERINO || room.BelgeNo); // Esneklik için farklı alan adlarını kontrol et
            const formattedBelgeNo = String(rawBelgeNo).replace(/ı/g, 'i').toLowerCase();


            // Bu alanları gerçek Polis Raporu XML yapınızdaki etiket isimlerine göre ayarlamalısınız!
            return {
                roomNo: getValueOrEmptyString(room.VERILENODANO),
                firstName: formattedFirstName,
                lastName: formattedLastName,
                belgeNo: formattedBelgeNo,
                birthDate: getValueOrEmptyString(room.DOGUMTARIHI),
                uyruk: getValueOrEmptyString(room.UYRUGU),
                belgeTuru: getValueOrEmptyString(room.KIMLIKBELGESITURU),
                ikametAdresi: getValueOrEmptyString(room.IKAMETADRESI),
                cin: getValueOrEmptyString(room.GELISTARIHI),
                cout: getValueOrEmptyString(room.AYRILISTARIHI)
            };
        });

    } catch (error) {
        console.error("transformPoliceReportData'da kritik hata oluştu:", error);
        throw new Error("Polis Raporu veri dönüşümü sırasında kritik bir hata oluştu: " + error.message);
    }

    return transformedRecords;
};