// src/services/fileProcessingService.js
import { useCallback } from 'react';
import { parseInhouseXML, transformInhouseData } from '../utils/processInhouseData';
import { parsePoliceReportXML, transformPoliceReportData } from '../utils/processPoliceReportData';
import { parseRoutingXML, transformRoutingData } from '../utils/processRoutingData';
import { parseCashringXML, transformCashringData } from '../utils/processCashringData';
import { parseKBSXLSX, transformKBSData } from '../utils/processKBSData';

/**
 * Dosya işleme mantığını içeren özel bir hook.
 * Bu hook, DataContext'ten gerekli setter fonksiyonlarını ve yardımcıları alır.
 * @param {Object} dataContextSetters - DataContext'ten gelen setter fonksiyonları ve helper'lar.
 * @param {Function} dataContextSetters.setRawInhouseData
 * @param {Function} dataContextSetters.setProcessedInhouseData
 * @param {Function} dataContextSetters.addGeneralInfo
 * @param {Function} dataContextSetters.addGeneralOperaError
 * @param {Function} dataContextSetters.setIsProcessing
 * @param {Function} dataContextSetters.setUploadError
 * @param {Function} dataContextSetters.setGeneralErrorsData
 * @returns {Function} handleFileUpload fonksiyonu
 */
export const useFileProcessing = ({
  setRawInhouseData,
  setProcessedInhouseData,

  setRawKBSData,
  setProcessedKBSData,

  setRawPolisRaporuData,
  setProcessedPolisRaporuData,

  setRawRoutingData,
  setProcessedRoutingData,

  setRawCashringData,
  setProcessedCashringData,

  setKbsErrorsData,
  setGeneralOperaErrorsData,
  setGeneralInfoData,

  setUploadError,
  setIsProcessing,

  addGeneralInfo,
  addGeneralOperaError
}) => {

  const handleFileUpload = useCallback(async (selectedFile, fileType) => {
    setIsProcessing(true);
    setUploadError(null);

    try {

      let rawContent;
      let transformedRecords = [];

      switch (fileType) {
        // ! İNHOUSE RAPORUNUN DOSYASININ CASE'İ

        case 'inhouse':
          try {
            rawContent = await parseInhouseXML(selectedFile);
            setRawInhouseData(rawContent);

            try {
              transformedRecords = transformInhouseData(rawContent);
              setProcessedInhouseData(transformedRecords);
              addGeneralInfo('success', `Inhouse verisi başarıyla dönüştürüldü. Toplam ${transformedRecords.length} kayıt.`, fileType);

            } catch (error) {
              throw error;
            }

          } catch (error) {
            throw error;
          }


          break;

        case 'kbs':
          try {
            rawContent = await parseKBSXLSX(selectedFile); // KBS XLSX'i ayrıştır
            setRawKBSData(rawContent); // Ham veriyi kaydet

            transformedRecords = transformKBSData(rawContent); // Veriyi dönüştür
            setProcessedKBSData(transformedRecords); // İşlenmiş veriyi kaydet
            addGeneralInfo('success', `KBS verisi başarıyla dönüştürüldü. Toplam ${transformedRecords.length} kayıt.`, fileType);

            // KBS'ye özgü hataları burada ele alabiliriz, eğer varsa
            // setKbsErrorsData([]); // Şimdilik boş bırakalım, sonra detaylandırılabilir
          } catch (error) {
            const errorMessage = error.message;
            const phase = errorMessage.includes("KBS dosyası") || errorMessage.includes("Excel") ? 'okuma/format' : 'veri dönüşümü';
            addGeneralInfo('error', `KBS dosyası işlenirken hata oluştu (${phase} aşaması): ${errorMessage}`, fileType, { phase: phase, originalError: error.message, file: selectedFile.name });
            throw error;
          }
          break;

        // ! POLİS RAPORUNUN DOSYASININ CASE'İ
        case 'policeReport':
          try {
            rawContent = await parsePoliceReportXML(selectedFile); // Polis Raporu XML'ini ayrıştır
            setRawPolisRaporuData(rawContent); // Ham veriyi kaydet
            try {
              transformedRecords = transformPoliceReportData(rawContent); // Veriyi dönüştür
              setProcessedPolisRaporuData(transformedRecords); // İşlenmiş veriyi kaydet
              addGeneralInfo('success', `Polis Raporu verisi başarıyla dönüştürüldü. Toplam ${transformedRecords.length} kayıt.`, fileType);
            } catch (error) {
              throw error;
            }
          } catch (error) {

            throw error;
          }

          break;


        // ! ROUTING DOSYASININ CASE'İ 
        case 'routing':
          try {
            rawContent = await parseRoutingXML(selectedFile);
            setRawRoutingData(rawContent);

            transformedRecords = transformRoutingData(rawContent);
            setProcessedRoutingData(transformedRecords);
            addGeneralInfo('success', `Routing verisi başarıyla dönüştürüldü. Toplam ${transformedRecords.length} kayıt.`, fileType);

          } catch (error) {
            throw error;
          }
          break;

        // ! CASHRING DOSYASININ CASE'İ 
        case 'cashring':
          try {
            rawContent = await parseCashringXML(selectedFile); // Cashring XML'ini ayrıştır
            setRawCashringData(rawContent); // Ham veriyi kaydet

            transformedRecords = transformCashringData(rawContent); // Veriyi dönüştür
            setProcessedCashringData(transformedRecords); // İşlenmiş veriyi kaydet
            addGeneralInfo('success', `Cashring verisi başarıyla dönüştürüldü. Toplam ${transformedRecords.length} kayıt.`, fileType);
          } catch (error) {
            throw error;
          }
          break;

        default:
          addGeneralInfo('error', `Bilinmeyen dosya tipi: ${fileType}`, fileType);
          setUploadError(`Bilinmeyen dosya tipi: ${fileType}`);
          break;
      }

      setUploadError(null); // İşlem başarılıysa hatayı temizle
      // addGeneralInfo('info', `Dosya işlemi başarıyla tamamlandı: ${selectedFile.name}`, fileType);

    } catch (error) {

      const errorMessage = `'${selectedFile ? selectedFile.name : 'Dosya'}' işlenirken bir hata oluştu: ${error.message}`;

      setUploadError(errorMessage);
      addGeneralInfo('error', errorMessage, { originalError: error.message, file: selectedFile?.name });

      // Hata durumunda ilgili state'i temizle
      switch (fileType) {
        case 'inhouse':
          setRawInhouseData(null);
          setProcessedInhouseData([]);
          break;

        case 'kbs': // KBS için de temizleme eklendi
          setRawKBSData(null);
          setProcessedKBSData([]);
          setKbsErrorsData([]); // Hataları da temizle
          break;

        case 'policeReport':
          setRawPolisRaporuData(null);
          setProcessedPolisRaporuData({});
          break;

        case 'routing':
          setRawRoutingData(null);
          setProcessedRoutingData({});
          break;
        case 'cashring': // Cashring için de temizleme eklendi
          setRawCashringData(null);
          setProcessedCashringData([]);
          break;
        default:
          break;
      }
    } finally {
      setIsProcessing(false); // Yükleme bitti
    }
  }, [
    setRawInhouseData, setProcessedInhouseData,
    setRawKBSData, setProcessedKBSData,
    setRawPolisRaporuData, setProcessedPolisRaporuData,
    setRawRoutingData, setProcessedRoutingData,
    setRawCashringData, setProcessedCashringData,

    setKbsErrorsData,

    addGeneralOperaError,
    setGeneralOperaErrorsData,

    addGeneralInfo,
    setGeneralInfoData,

    setIsProcessing,
    setUploadError,
  ]);

  return handleFileUpload;
};