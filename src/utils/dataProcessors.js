// src/utils/processInhouseData.js
import { xml2json } from 'xml-js';

/**
 * inhouse.xml dosyasından ham veriyi okur ve JSON objesine dönüştürür.
 * @param {File} file - Yüklenen inhouse.xml dosyası.
 * @returns {Promise<Object>} - Ham XML verisinin JSON hali.
 */
export const parseInhouseXML = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlString = e.target.result;
        // XML'i JSON'a dönüştürüyoruz. compact: true ile daha okunabilir bir JSON yapısı elde ederiz.
        const json = JSON.parse(xml2json(xmlString, { compact: true, spaces: 4 }));
        resolve(json); // Ham XML verisinin JSON hali
      } catch (error) {
        reject(new Error('inhouse.xml dosyasını okurken hata oluştu: ' + error.message));
      }
    };
    reader.onerror = (error) => {
      reject(new Error('Dosya okuma hatası: ' + error.target.error));
    };
    reader.readAsText(file); // XML metin olarak okunur
  });
};

/**
 * Ham inhouse.xml verisinden işlenmiş veri kümelerini oluşturur.
 * Bu fonksiyon, inhouse.xml dosyanızın GERÇEK yapısına göre özelleştirilmelidir.
 * @param {Object} rawData - Ham inhouse.xml verisinin JSON hali.
 * @returns {Object} - İşlenmiş veri kümelerini içeren bir obje (tableData, kbsErrors, generalErrors, generalInfo).
 */
export const transformInhouseData = (rawData) => {
  let tableData = [];
  let kbsErrors = [];        // Inhouse'da KBS hatası beklemeyiz, ama yapıyı koruyalım
  let generalErrors = [];
  let generalInfo = { sourceFile: 'inhouse', totalRecords: 0, issues: [] };

  try {
    // Örnek XML yapısı varsayımı: <root><Rooms><Room>...
    // Lütfen inhouse.xml dosyanızı açıp gerçek yolu buraya yazın.
    const inhouseRooms = rawData.root?.Rooms?.Room || []; 

    tableData = inhouseRooms.map(room => ({
      id: room._attributes?.id || Math.random(), // Eğer ID attribute olarak varsa, yoksa rastgele
      odaNo: room.OdaNo?._text,                 // OdaNo etiketi altında metin node'u
      isim: room.Guest?.Name?._text,            // Misafir adı
      raceCode: room.Guest?.RaceCode?._text,    // Race Code
      company: room.Company?._text,             // Şirket
      // ... inhouse.xml'inizdeki diğer ilgili alanları buraya ekleyin
      source: 'Inhouse' // Bu verinin inhouse.xml'den geldiğini belirtelim
    }));

    // Inhouse.xml için özel hata veya bilgi çıkarma mantığı varsa buraya ekleyin.
    // Örn: inhouse.xml içinde özel bir uyumsuzluk alanı varsa
    generalErrors.push(...inhouseRooms.filter(room => room.Status?._text === 'Inhouse_Uyumsuz').map(err => ({
        file: 'inhouse',
        description: 'Inhouse verisi uyumsuzluk',
        odaNo: err.OdaNo?._text
    })));

    generalInfo.totalRecords = inhouseRooms.length;
    generalInfo.inhouseErrorCount = generalErrors.length; // Inhouse'a özgü hata sayısı

  } catch (error) {
    console.error('inhouse verisi dönüştürülürken hata oluştu:', error);
    generalErrors.push({
      file: 'inhouse',
      description: 'Veri dönüştürme hatası: ' + error.message,
      detail: rawData // Ham veriyi hata detayına ekleyebiliriz
    });
  }

  return { tableData, kbsErrors, generalErrors, generalInfo };
};