// src/context/DataContext.js
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
// 
import { useFileProcessing } from '../services/fileProcessingService';


const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // 1. Raw Data State'leri (Her dosya tipi için ayrı)
  const [rawInhouseData, setRawInhouseData] = useState(null);
  const [rawKBSData, setRawKBSData] = useState(null);
  const [rawPolisRaporuData, setRawPolisRaporuData] = useState(null);
  const [rawRoutingData, setRawRoutingData] = useState(null);
  const [rawCashringData, setRawCashringData] = useState(null);

  // 2. Processed Data State'leri (Her dosya tipi için ayrı)
  const [processedInhouseData, setProcessedInhouseData] = useState([]);
  const [processedKBSData, setProcessedKBSData] = useState([]);
  const [processedPolisRaporuData, setProcessedPolisRaporuData] = useState([]);
  const [processedRoutingData, setProcessedRoutingData] = useState({});
  const [processedCashringData, setProcessedCashringData] = useState({});

  // 3. Genel Kontrol ve Hata State'leri
  const [mainTableData, setMainTableData] = useState([]); // Ana tablo için
  const [kbsErrorsData, setKbsErrorsData] = useState([]); // KBS'e özel hata listesi
  const [generalOperaErrorsData, setGeneralOperaErrorsData] = useState([]); // Operaya özel hataların

  const [checks, setChecks] = useState([
    { id: 'kbs_police_report', name: 'KBS/Opera', status: 'pending' },
    { id: 'guestCount', name: 'Kişi Sayısı ', status: 'pending' }, // Başlangıçta pending olabilir
    { id: 'tcPassport', name: 'TC/Pasaport ', status: 'pending' },
    { id: 'birth_date_check', name: 'Doğum Tarihi ', status: 'pending' },
    { id: 'clCa', name: 'CL/CA ', status: 'pending' },
    { id: 'routingComment', name: 'Routing-Comment ', status: 'pending' },
  ]);

  // YENİ: Tek bir kontrolün durumunu güncellemek için fonksiyon
  const updateCheckStatus = (checkId, newStatus) => {
    setChecks(prevChecks =>
      prevChecks.map(check =>
        check.id === checkId ? { ...check, status: newStatus } : check
      )
    );
  };

  const [generalInfoData, setGeneralInfoData] = useState({
    messages: [{
      id: Date.now(), // Benzersiz ID
      type: 'info',
      text: 'Program başlatıldı ve kullanıma hazır.',
      fileType: 'general'
    }]
  });
  // UI Durum State'leri
  const [uploadError, setUploadError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  // Helper function to add a message to generalInfoData state
  const addGeneralInfo = useCallback((type, text, fileType = 'general') => {
    setGeneralInfoData(prevInfo => {
      const newMessages = prevInfo.messages ? [...prevInfo.messages] : [];
      newMessages.push({ id: Date.now() + Math.random(), type, text, fileType });
      return { ...prevInfo, messages: newMessages };
    });
  }, []);

  // Helper function to add an error to generalOperaErrorsData state
  const addGeneralOperaError = useCallback((type, message, details = {}) => {
    setGeneralOperaErrorsData(prevErrors => {
      const newErrors = [...prevErrors];
      newErrors.push({ id: Date.now() + Math.random(), type, message, timestamp: new Date().toISOString(), ...details });
      return newErrors;
    });
  }, []);

  // useFileProcessing hook'unu çağırarak handleFileUpload fonksiyonunu alıyoruz
  // Tüm gerekli setter'ları ve helper'ları bu hook'a iletiyoruz
  const handleFileUpload = useFileProcessing({
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
    setGeneralInfoData,
    setGeneralOperaErrorsData,

    setUploadError,
    setIsProcessing,

    addGeneralInfo,
    addGeneralOperaError,
  });

  // Context üzerinden sağlanacak değerler
  const contextValue = useMemo(() => ({
    rawInhouseData, setRawInhouseData,
    processedInhouseData, setProcessedInhouseData,

    rawKBSData, setRawKBSData,
    processedKBSData, setProcessedKBSData,

    rawPolisRaporuData, setRawPolisRaporuData,
    processedPolisRaporuData, setProcessedPolisRaporuData,

    rawRoutingData, setRawRoutingData,
    processedRoutingData, setProcessedRoutingData,

    rawCashringData, setRawCashringData,
    processedCashringData, setProcessedCashringData,

    mainTableData, setMainTableData,
    kbsErrorsData, setKbsErrorsData,
    generalOperaErrorsData, setGeneralOperaErrorsData,
    generalInfoData, setGeneralInfoData,

    uploadError, setUploadError,
    isProcessing, setIsProcessing,

    checks,
    updateCheckStatus,


    handleFileUpload, // Artık dışarıdan geliyor
    addGeneralInfo, // Dışarıdan hala erişilebilir olmalı
    addGeneralOperaError // Dışarıdan hala erişilebilir olmalı
  }), [
    rawInhouseData, processedInhouseData,
    rawKBSData, processedKBSData,
    rawPolisRaporuData, processedPolisRaporuData,
    rawRoutingData, processedRoutingData,
    rawCashringData, processedCashringData,

    mainTableData, kbsErrorsData,
    generalOperaErrorsData, generalInfoData,

    checks,
    updateCheckStatus,


    uploadError, isProcessing,
    handleFileUpload, // useFileProcessing'den geldiği için stable
    addGeneralInfo,
    addGeneralOperaError // useCallback ile sarılı olduğu için stable
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};