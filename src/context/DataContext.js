import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [globalParsedData, setGlobalParsedData] = useState(null);
  const [globalErrors, setGlobalErrors] = useState([]);
  const [globalTableData, setGlobalTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // YENİ STATE'LERİ EKLE
  const [mainInhouseData, setMainInhouseData] = useState([]); // XML'den çekilen ham verinin belirli kısımları
  const [mainOperaData, setMainOperaData] = useState([]);   // İşlenmiş ve birleştirilmiş ana veri

  return (
    <DataContext.Provider value={{
      globalParsedData,
      setGlobalParsedData,
      globalErrors,
      setGlobalErrors,
      globalTableData,
      setGlobalTableData,
      isLoading,
      setIsLoading,
      mainInhouseData,     // Yeni state'i context'e ekle
      setMainInhouseData,  // Yeni setter fonksiyonunu context'e ekle
      mainOperaData,       // Yeni state'i context'e ekle
      setMainOperaData     // Yeni setter fonksiyonunu context'e ekle
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};