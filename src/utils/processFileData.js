import { processXmlFile } from './fileHandlers'; // XML okuma fonksiyonu
// import { processXlsxFile } from './fileHandlers'; // İleride XLSX için eklenecek

// Bu fonksiyonu App.js'ten veya FileSelectionAndInfoSection'dan çağıracağız
export const handleFileProcessing = async (file, fileType, dataContext) => {
  const { setGlobalParsedData, setGlobalErrors, setIsLoading, setMainInhouseData, setMainOperaData } = dataContext;

  setIsLoading(true);
  setGlobalErrors([]); // Önceki global hataları temizle

  try {
    let processedResult = null;
    let extractedData = [];
    let processingError = null;

    if (fileType === 'inhouse' && file.name.endsWith('.xml')) {
      processedResult = await processXmlFile(file);
      setGlobalParsedData(processedResult.data);

      const rawInhouseGuests = processedResult.data?.GIBYROOM?.CS_STAY_ROOMS?.LIST_G_ROOM?.G_ROOM;

      if (rawInhouseGuests && Array.isArray(rawInhouseGuests)) {
        extractedData = rawInhouseGuests.map(guest => ({
          fullName: guest.FULL_NAME?._text || guest.FULL_NAME || '',
          arrival: guest.ARRIVAL?._text || guest.ARRIVAL || '',
          departure: guest.DEPARTURE?._text || guest.DEPARTURE || '',
          room: guest.ROOM?._text || guest.ROOM || '',
          roomCategoryLabel: guest.ROOM_CATEGORY_LABEL?._text || guest.ROOM_CATEGORY_LABEL || '',
          adults: parseInt(guest.ADULTS?._text || guest.ADULTS || 0),
          children: parseInt(guest.CHILDREN?._text || guest.CHILDREN || 0),
          resort: guest.RESORT?._text || guest.RESORT || '',
          companyName: guest.COMPANY_NAME?._text || guest.COMPANY_NAME || '',
          paymentMethod: guest.PAYMENT_METHOD?._text || guest.PAYMENT_METHOD || '',
          currencyCode: guest.CURRENCY_CODE?._text || guest.CURRENCY_CODE || '',
          shareAmount: parseFloat(guest.SHARE_AMOUNT?._text || guest.SHARE_AMOUNT || 0),
          sourceFile: file.name
        }));
        setMainInhouseData(extractedData);
        console.log(`'${fileType}' dosyası işlendi:`, extractedData);

        // Şimdilik mainOperaData'yı direkt mainInhouseData ile dolduruyoruz.
        // İleride diğer dosyalardan gelen verilerle birleştirme ve işleme mantığı buraya gelecek.
        setMainOperaData(extractedData);
      } else {
        processingError = {
          code: 'XML_DATA_STRUCTURE_ERROR',
          description: `XML dosyasında beklenen 'G_ROOM' verisi bulunamadı veya yapı farklı: ${file.name}`,
          severity: 'danger'
        };
        setGlobalErrors(prevErrors => [...prevErrors, processingError]);
        setMainInhouseData([]);
        setMainOperaData([]);
      }
    } else if (fileType === 'kbs' && file.name.endsWith('.xml')) {
      // KBS dosyası işleme mantığı buraya gelecek
      // processedResult = await processXmlFile(file);
      // ... KBS'ye özel veri çıkarma ve kaydetme
      console.log(`KBS dosyası (${file.name}) seçildi, işleme mantığı eklenecek.`);
    } else if (fileType === 'routing' && file.name.endsWith('.xml')) {
        // Routing dosyası işleme mantığı
        console.log(`Routing dosyası (${file.name}) seçildi, işleme mantığı eklenecek.`);
    } else if (fileType === 'policeReport' && file.name.endsWith('.xlsx')) {
        // Polis Raporu (XLSX) işleme mantığı
        console.log(`Polis Raporu dosyası (${file.name}) seçildi, işleme mantığı eklenecek.`);
    } else if (fileType === 'casting' && file.name.endsWith('.xml')) {
        // Casting dosyası işleme mantığı
        console.log(`Casting dosyası (${file.name}) seçildi, işleme mantığı eklenecek.`);
    } else {
      processingError = {
        code: 'UNSUPPORTED_FILE_TYPE',
        description: `Desteklenmeyen dosya tipi veya uzantısı: ${file.name} for ${fileType}`,
        severity: 'warning'
      };
      setGlobalErrors(prevErrors => [...prevErrors, processingError]);
    }

    if (processingError) {
      throw new Error(processingError.message); // Hata varsa catch bloğuna düşür
    }

  } catch (error) {
    console.error("Dosya işlenirken hata oluştu:", error);
    setGlobalErrors(prevErrors => [...prevErrors, {
      code: error.type || 'PROCESSING_FAILED',
      description: error.message || `Dosya işlenemedi: ${file.name}`,
      severity: 'danger'
    }]);
    setGlobalParsedData(null);
    setMainInhouseData([]);
    setMainOperaData([]);
  } finally {
    setIsLoading(false);
  }
};