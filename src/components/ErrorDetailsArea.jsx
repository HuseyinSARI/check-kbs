import React, { useMemo } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

function ErrorDetailsArea() {
  const { 
    generalOperaErrorsData, 
    setGeneralOperaErrorsData, 
    rawInhouseData, 
    rawKBSData,
    rawPolisRaporuData,
    rawRoutingData,
    rawCashringData,
  } = useData();

  const hasAnyFileUploaded = 
    rawInhouseData !== null ||
    rawKBSData !== null ||
    rawPolisRaporuData !== null ||
    rawRoutingData !== null ||
    rawCashringData !== null;

  // useMemo ile hata listesini oda numarasına göre sıralıyoruz
  const sortedErrors = useMemo(() => {
    if (!generalOperaErrorsData || generalOperaErrorsData.length === 0) {
      return [];
    }

    // Orijinal diziyi bozmamak için bir kopyasını oluşturuyoruz
    return [...generalOperaErrorsData].sort((a, b) => {
      // roomNo alanını sayıya dönüştürüyoruz
      const roomNoA = parseInt(a.roomNo, 10);
      const roomNoB = parseInt(b.roomNo, 10);

      // Sayı olmayan veya tanımsız değerleri en sona atıyoruz
      if (isNaN(roomNoA) && isNaN(roomNoB)) return 0;
      if (isNaN(roomNoA)) return 1;
      if (isNaN(roomNoB)) return -1;

      // Sayısal olarak karşılaştırıyoruz
      return roomNoA - roomNoB;
    });
  }, [generalOperaErrorsData]); // generalOperaErrorsData değiştiğinde yeniden hesapla

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
          {!hasAnyFileUploaded ? (
            <div className="text-info lead text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              **Bir dosya yüklenmesi bekleniyor...**
            </div>
          ) : (
            // sortedErrors listesini kullanıyoruz
            sortedErrors.length > 0 ? ( 
              <ul className="list-unstyled">
                {sortedErrors.map((error, index) => ( 
                  <li 
                    key={error.id || `${error.type}-${index}`} 
                    className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                    style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}
                  >
                    <span className="me-auto text-break">
                        {error.message}
                    </span>
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