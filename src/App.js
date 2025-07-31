import React from 'react';
import { Container } from 'react-bootstrap';
// Kendi oluşturduğumuz bileşenleri import ediyoruz
import FileSelectionAndInfoSection from './components/FileSelectionAndInfoSection';
import KBSErrorsSection from './components/KBSErrorsSection';
import TableSection from './components/TableSection';
import { useMainControls } from './controls/mainControls'; // Yeni hook'u içe aktarıyoruz

import { useData } from './context/DataContext'; // useData hook'unu import et


function App() {
  useMainControls(); 

  // Sadece context'ten ihtiyacımız olan değerleri çekiyoruz
  // const {
  //   handleFileUpload,
  //   uploadError,
  //   isProcessing,
  //   rawInhouseData,        // Yeni isimlendirme
  //   processedInhouseData   // Yeni isimlendirme
  // } = useData();

  // // Yükleme durumu değiştiğinde konsola yazdır
  // // Bu sadece state'lerin doğru güncellendiğini teyit etmek içindir.
  // React.useEffect(() => {
  //   if (!isProcessing && !uploadError && rawInhouseData) {
  //     console.log("App.js: Inhouse verisi Context'te başarıyla yüklendi!");
  //     // Bu verileri App.js içinde doğrudan göstermiyoruz, sadece konsola yazdırıyoruz.
  //     // rawFileData.inhouse ve processedFileData.inhouse değerlerini burada kullanabilirsin.
  //   }
  // }, [isProcessing, uploadError, rawInhouseData, processedInhouseData]); // Bağımlılıklar güncellendi


  return (
    // Bootstrap'ın Container bileşeni ile sayfa içeriğini ortalıyor ve boşluk bırakıyoruz
    <Container fluid className="my-5 ">
      {/* 1. Bölüm */}
      <FileSelectionAndInfoSection />

      {/* 2. Bölüm */}
      <KBSErrorsSection />

      {/* 3. Bölüm */}
      <TableSection />
    </Container>
  );
}

export default App;