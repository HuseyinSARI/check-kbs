import { XMLParser } from 'fast-xml-parser';

/**
 * Routing XML dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * Dosyanın Routing XML yapısına uygun olup olmadığını kontrol eder.
 * @param {File} file - Yüklenen Routing XML dosyası.
 * @returns {Promise<Object>} - Ham XML verisinin JSON hali.
 * @throws {Error} - Dosya okuma, ayrıştırma veya Routing yapısı kontrolünde hata oluşursa.
 */
export const parseRoutingXML = (file) => {
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

                if (!json?.ROUTING_DETAILS?.LIST_G_GROUP1_SORT?.G_GROUP1_SORT?.LIST_G_GROUP2_SORT?.G_GROUP2_SORT?.LIST_G_ROOM_NO?.G_ROOM_NO) {
                    throw new Error(`Geçerli bir routing_details dosyası yükleyin.`);
                }

                resolve(json);
            } catch (error) {
                // XML ayrıştırma hatası veya yapısal hata
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
 * Ham Routing XML verisinden işlenmiş veri dizisini oluşturur.
 * Bu fonksiyon, uygulamanın kullanabileceği belirli alanları ayıklayarak bir dizi döndürür.
 * @param {Object} rawData - Ham Routing XML verisinin JSON hali.
 * @returns {Array<Object>} - İstediğiniz alanları içeren işlenmiş veri objeleri dizisi.
 */
export const transformRoutingData = (rawData) => {
    let transformedRecords = [];

    try {
        const records = rawData?.ROUTING_DETAILS?.LIST_G_GROUP1_SORT?.G_GROUP1_SORT?.LIST_G_GROUP2_SORT?.G_GROUP2_SORT?.LIST_G_ROOM_NO?.G_ROOM_NO || [];
        const recordsArray = Array.isArray(records) ? records : [records]; // Tek kayıt varsa diziye çevir

        // Helper function: Boş string yerine sadece null/undefined ise boş string atar, 0'ı korur.
        const getValueOrEmptyString = (value) => {
            return value === null || value === undefined ? '' : value;
        };
        transformedRecords = recordsArray
            .filter(record => {
                const roomNoValue = getValueOrEmptyString(record.ROOM_NO); // Bu etiket adını kontrol et!
                const roomNoInt = parseInt(roomNoValue, 10);
                const shortResvStatus = getValueOrEmptyString(record.SHORT_RESV_STATUS).toUpperCase(); 

                // Oda numarasının boş olmadığını ve 9000'den büyük olmadığını kontrol et
                const isRoomNoValid = roomNoValue !== '' && (isNaN(roomNoInt) || roomNoInt < 9000);

                const isCheckedIn = shortResvStatus === 'CKIN';

                return isRoomNoValid && isCheckedIn; // Her iki koşulun da sağlanması gerekiyor
            })
            .map((record, index) => {
                return {
                    roomNo: getValueOrEmptyString(record.ROOM_NO),
                    routingList: getValueOrEmptyString(record.LIST_G_ROUTING), // Bu alanın içeriği muhtemelen daha karmaşık bir obje veya dizi olacak, dikkat!
                    fullName: getValueOrEmptyString(record.FULL_NAME),
                };
            })
            .sort((a, b) => {
                const roomNoA = parseInt(a.roomNo, 10);
                const roomNoB = parseInt(b.roomNo, 10);

                // Geçersiz (NaN) oda numaralarını sona at veya özel bir durumla ele al
                if (isNaN(roomNoA) && isNaN(roomNoB)) return 0; // İkisi de geçersizse sıra önemli değil
                if (isNaN(roomNoA)) return 1; // A geçersizse B'den sonra gelsin
                if (isNaN(roomNoB)) return -1; // B geçersizse A'dan sonra gelsin

                return roomNoA - roomNoB; // Sayısal olarak küçükten büyüğe sırala
            });

    } catch (error) {
        console.error("transformRoutingData'da kritik hata oluştu:", error);
        throw new Error("Routing veri dönüşümü sırasında kritik bir hata oluştu: " + error.message);
    }

    return transformedRecords;
};