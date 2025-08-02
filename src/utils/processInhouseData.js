// src/utils/processInhouseData.js
import { XMLParser } from 'fast-xml-parser';

/**
 * Yüklenen dosyanın inhouse.xml olup olmadığını ve bir XML dosyası olup olmadığını kontrol eder.
 * @param {File} file - Kontrol edilecek dosya.
 * @returns {void} - Dosya uygun değilse hata fırlatır.
 * @throws {Error} - Dosya inhouse.xml veya XML değilse hata fırlatır.
 */
/**
 * inhouse.xml dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * @param {File} file - Yüklenen inhouse.xml dosyası.
 * @returns {Promise<Object>} - Ham XML verisinin JSON hali.
 */

export const parseInhouseXML = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("Yüklenecek bir dosya seçilmedi."));
      return;
    }

    // Dosya uzantısı kontrolü hala yapılabilir, ancak asıl kontrol XML içeriğinde olacak.
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
          textNodeName: "#text",
        };

        const parser = new XMLParser(options);
        const json = parser.parse(xmlString);
        
        if (!json?.GIBYROOM?.LIST_G_ROOM?.G_ROOM) {
          throw new Error(`Geçerli bir inhouse dosyası yükleyin`);
        }

        resolve(json);
      } catch (error) {
        reject(new Error(error.message));
      }
    };
    reader.onerror = (error) => {
      reject(new Error('Dosya okuma hatası: ' + error.target.error));
    };
    reader.readAsText(file);
  });
};

/**
 * Ham inhouse.xml verisinden doğrudan işlenmiş veri dizisini oluşturur.
 * Bu fonksiyon sadece belirtilen alanları içeren bir dizi döndürür.
 * Hata ve genel bilgi toplama sorumluluğu DataContext'e bırakılır.
 * @param {Object} rawData - Ham inhouse.xml verisinin JSON hali.
 * @returns {Array<Object>} - İstediğiniz alanları içeren işlenmiş veri objeleri dizisi.
 */
export const transformInhouseData = (rawData) => {
  let transformedRecords = []; // Bu doğrudan işlenmiş kayıtları tutacak

  try {
    const inhouseRooms = rawData?.GIBYROOM?.LIST_G_ROOM?.G_ROOM || [];
    const roomsArray = Array.isArray(inhouseRooms) ? inhouseRooms : [inhouseRooms];


     // Sayısal değerleri kontrol eden yardımcı fonksiyon
     const getValueOrEmptyString = (value) => {
      // Değer null veya undefined ise boş string döndür, aksi takdirde değeri olduğu gibi kullan
      // Not: 0 değeri false olmadığı için bu kontrol 0'ı koruyacaktır.
      return (value === null || value === undefined) ? '' : value;
    };


    transformedRecords = roomsArray.map((room, index) => {
      return {
        roomNo: getValueOrEmptyString(room.ROOM),
        name: getValueOrEmptyString(room.FULL_NAME),
        companyName: getValueOrEmptyString(room.COMPANY_NAME),
        rateCode: getValueOrEmptyString(room.RATE_CODE),
        rate: getValueOrEmptyString(room.SHARE_AMOUNT),
        accompanyNames: getValueOrEmptyString(room.ACCOMPANYING_NAMES),
        paymentMethod: getValueOrEmptyString(room.PAYMENT_METHOD),
        currencyCode: getValueOrEmptyString(room.CURRENCY_CODE),
        adults: getValueOrEmptyString(room.ADULTS),
        children: getValueOrEmptyString(room.CHILDREN),
        balance: getValueOrEmptyString(room.BALANCE),
        departureDate: getValueOrEmptyString(room.DEPARTURE),
        arrivalDate: getValueOrEmptyString(room.ARRIVAL),
        comment: getValueOrEmptyString(room.LIST_G_COMMENT_RESV_NAME_ID)
      };
    });

  } catch (error) {
    // Burada sadece dönüşümün kendisinde oluşan kritik hataları yakalarız
    // Ve bu hatayı fırlatırız, DataContext onu yakalar ve generalErrorsData'ya ekler.
    console.error("transformInhouseData'da kritik hata oluştu:", error);
    throw new Error("Veri dönüşümü sırasında kritik hata oluştu: " + error.message);
  }

  // Sadece işlenmiş kayıtlar dizisini döndürüyoruz
  return transformedRecords;
};