import { XMLParser } from 'fast-xml-parser'; // XMLParser'ı import et

// XML dosyasını okuyup JSON'a çeviren fonksiyon
export const processXmlFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target.result;
      try {
        const parser = new XMLParser({
          ignoreAttributes: false, // XML niteliklerini (attributes) JSON'a dahil et
          attributeNamePrefix: "@_", // Niteliklerin başına eklenecek önek (isteğe bağlı)
          // Diğer seçenekler: https://github.com/NaturalIntelligence/fast-xml-parser#xmlparser-properties
        });
        const result = parser.parse(fileContent);
        resolve({ data: result, fileName: file.name, fileType: 'xml' });
      } catch (error) {
        console.error(`XML ayrıştırma hatası (${file.name}):`, error);
        reject({
          type: 'XML_PARSE_ERROR',
          message: `XML dosyası ayrıştırılamadı: ${file.name}. Hata: ${error.message}`
        });
      }
    };

    reader.onerror = (error) => {
      console.error(`Dosya okuma hatası (${file.name}):`, error);
      reject({
        type: 'FILE_READ_ERROR',
        message: `Dosya okunurken bir hata oluştu: ${file.name}. Hata: ${error.message}`
      });
    };

    reader.readAsText(file); // XML dosyasını metin olarak oku
  });
};
