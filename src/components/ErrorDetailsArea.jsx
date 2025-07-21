import React, { useState } from 'react'; // useState hook'unu import ettik
import { Card, Button, Alert } from 'react-bootstrap';

function ErrorDetailsArea() {
  // Hataları bir state olarak tanımlıyoruz
  // Bu, hatalar değiştiğinde React'in arayüzü yeniden render etmesini sağlar
  const [errors, setErrors] = useState([
    "Oda no: 101 - Rate kodu yanlış",
    "Oda no: 213 - Kişi sayısı hatalı",
    "Oda no: 510 - Ali Kemal - TC-Pas alanı boş",
    "Oda no: 813 - Fuat Mav - Doğrum tarihi boş",
    "Oda no: 823 - CL/CA kısmı yanlış",
    "Oda no: 920 - Sunexpress hava yolu comment-routing uyumsuz.",
    "Oda no: 110 - Rezervasyon bulunamadı",
    "Oda no: 115 - Misafir adı eksik",
    "Oda no: 220 - Giriş tarihi hatalı",
    "Oda no: 305 - Çıkış tarihi hatalı",
    "Oda no: 401 - Oda tipi uyumsuz",
    "Oda no: 610 - Ödeme yöntemi geçersiz",
    "Oda no: 707 - Şirket adı boş",
    "Oda no: 888 - Para birimi uyuşmuyor",
    "Oda no: 999 - Paylaşım miktarı sıfır",
  ]);

  // Hata silme işlevi: Seçilen hatayı listeden kaldırır
  const handleDeleteError = (indexToRemove) => {
    // filter metodu ile, indexToRemove dışındaki tüm hataları içeren yeni bir dizi oluştururuz
    const updatedErrors = errors.filter((_, index) => index !== indexToRemove);
    setErrors(updatedErrors); // State'i güncelleriz, bu da arayüzü otomatik olarak günceller
  };

  return (
    <Card className="shadow-sm" style={{ 
    }}>
      <Card.Body>
        <Card.Title className="text-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Genel Hatalar
        </Card.Title>
        <div 
          style={{ 
            height: '400px', 
            overflowY: 'auto',   
            paddingRight: '10px'
          }}
          className="error-list-container"
        >
          {errors.length > 0 ? ( // 'sampleErrors' yerine 'errors' state'ini kullandık
            <ul className="list-unstyled">
              {errors.map((error, index) => ( // 'sampleErrors' yerine 'errors' state'ini kullandık
                <li 
                  key={index} // Her liste öğesi için benzersiz bir 'key' prop'u çok önemli
                  className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                  style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}
                >
                  <span className="me-auto text-break">{error}</span>
                  <Button
                    variant="link"
                    className="text-danger p-0 ms-2"
                    onClick={() => handleDeleteError(index)} // Doğru indeksi gönderiyoruz
                    aria-label="Hatayı Sil"
                  >
                    <i className="bi bi-x-circle-fill fs-5"></i> {/* X simgesi */}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <Alert variant="success">
              <i className="bi bi-check-circle-fill me-2"></i> Harika! Henüz bir hata bulunamadı.
            </Alert>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ErrorDetailsArea;