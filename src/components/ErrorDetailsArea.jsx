// src/components/ErrorDetailsArea.jsx
import React from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

function ErrorDetailsArea() {
  // Hataları, güncelleme fonksiyonunu ve ilgili tüm raw data state'lerini DataContext'ten alıyoruz
  const { 
    generalOperaErrorsData, 
    setGeneralOperaErrorsData, 
    rawInhouseData, // Her bir raw data'yı çektik
    rawKBSData,
    rawPolisRaporuData,
    rawRoutingData,
    rawCashringData,
  } = useData();

  // Herhangi bir dosyanın yüklenip yüklenmediğini kontrol eden yeni bir flag
  // raw data state'lerinden herhangi biri null değilse, bir dosya yüklenmiş demektir.
  const hasAnyFileUploaded = 
    rawInhouseData !== null ||
    rawKBSData !== null ||
    rawPolisRaporuData !== null ||
    rawRoutingData !== null ||
    rawCashringData !== null;

  // Hata silme işlevi: Seçilen hatayı listeden kaldırır
  const handleDeleteError = (idToRemove) => {
    const updatedErrors = generalOperaErrorsData.filter((error) => error.id !== idToRemove);
    setGeneralOperaErrorsData(updatedErrors);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Genel Hatalar
        </Card.Title>
        <div 
          style={{ 
            height: '600px', 
            overflowY: 'auto',  
            paddingRight: '10px'
          }}
          className="error-list-container"
        >
          {/* hasAnyFileUploaded durumuna göre içeriği koşullu olarak render etme */}
          {!hasAnyFileUploaded ? (
            // 1. Durum: Henüz hiçbir dosya yüklenmediyse
            <div className="text-info lead text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              **Bir dosya yüklenmesi bekleniyor...**
            </div>
          ) : (
            // 2. Durum: En az bir dosya yüklendiyse (kontrollerin başlamış veya bitmiş olması beklenir)
            generalOperaErrorsData.length > 0 ? ( 
              // Hatalar varsa, hata listesini göster
              <ul className="list-unstyled">
                {generalOperaErrorsData.map((error) => ( 
                  <li 
                    key={error.id || `${error.type}-${error.message}`} 
                    className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                    style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}
                  >
                    <span className="me-auto text-break">{error.message}</span>
                    <Button
                      variant="link"
                      className="text-danger p-0 ms-2"
                      onClick={() => handleDeleteError(error.id)} 
                      aria-label="Hatayı Sil"
                    >
                      <i className="bi bi-x-circle-fill fs-5"></i>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              // Hata yoksa, başarı mesajını göster
              <Alert variant="success" className="text-center">
                <i className="bi bi-check-circle-fill me-2"></i> Harika! Hiçbir genel hata bulunamadı.
              </Alert>
            )
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ErrorDetailsArea;