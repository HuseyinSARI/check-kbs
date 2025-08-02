// src/utils/processCashringData.js
import { XMLParser } from 'fast-xml-parser';

/**
 * Cashring (p2009) XML dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * Dosyanın Cashring XML yapısına uygun olup olmadığını kontrol eder.
 * @param {File} file - Yüklenen Cashring XML dosyası.
 * @returns {Promise<Object>} - Ham XML verisinin JSON hali.
 * @throws {Error} - Dosya okuma, ayrıştırma veya Cashring yapısı kontrolünde hata oluşursa.
 */
export const parseCashringXML = (file) => {
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


                if (!json?.P2009_BALANCEBYWINDOW?.LIST_G_ROOM?.G_ROOM) { 
                    throw new Error(`Geçerli bir Cashring dosyası yükleyin.`);
                }

                resolve(json);
            } catch (error) {
                // XML ayrıştırma hatası veya yapısal hata
                reject(new Error(`Cashring XML dosyası ayrıştırma veya yapı kontrol hatası: ${error.message}`));
            }
        };
        reader.onerror = (error) => {
            reject(new Error(`"${file.name}" dosyası okuma hatası: ${error.target.error?.message || error.target.error || 'Bilinmeyen hata'}`));
        };
        reader.readAsText(file);
    });
};

/**
 * Ham Cashring XML verisinden işlenmiş veri dizisini oluşturur.
 * Bu fonksiyon, uygulamanın kullanabileceği belirli alanları ayıklayarak bir dizi döndürür.
 * @param {Object} rawData - Ham Cashring XML verisinin JSON hali.
 * @returns {Array<Object>} - İstediğiniz alanları içeren işlenmiş veri objeleri dizisi.
 */
export const transformCashringData = (rawData) => {
    let transformedRecords = [];

    try {
        // Varsayım: P2009_CASHIER_CLOSURE?.LIST_G_TRANSACTIONS?.G_TRANSACTIONS
        const transactions = rawData?.P2009_BALANCEBYWINDOW?.LIST_G_ROOM?.G_ROOM || [];
        const transactionsArray = Array.isArray(transactions) ? transactions : [transactions]; // Tek kayıt varsa diziye çevir

        // Helper function: Boş string yerine sadece null/undefined ise boş string atar, 0'ı korur.
        const getValueOrEmptyString = (value) => {
            return value === null || value === undefined ? '' : value;
        };

        transformedRecords = transactionsArray.map((transaction, index) => {
            // kendi gerçek Cashring XML yapındaki etiket isimlerine göre ayarlamalısın!
            return {
                accRate: getValueOrEmptyString(transaction.ACC_RATE), 
                balance: getValueOrEmptyString(transaction.BALANCE), 
                roomNo: getValueOrEmptyString(transaction.ROOM), 
                PM: getValueOrEmptyString(transaction.PM), 
                variance: getValueOrEmptyString(transaction.VARIANCE),
                win1: getValueOrEmptyString(transaction.WINDOW1),
                win2: getValueOrEmptyString(transaction.WINDOW2),
                win3: getValueOrEmptyString(transaction.WINDOW3),
                win4: getValueOrEmptyString(transaction.WINDOW4),
                // ... Cashring dosyasından almanız gereken diğer alanlar buraya eklenecek
            };
        });

    } catch (error) {
        console.error("transformCashringData'da kritik hata oluştu:", error);
        throw new Error("Cashring veri dönüşümü sırasında kritik bir hata oluştu: " + error.message);
    }

    return transformedRecords;
};