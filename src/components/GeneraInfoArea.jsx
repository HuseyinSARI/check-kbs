import React from 'react';
import { Card, Spinner, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap'; // Yeni bileşenleri import ettik

function GeneralInfoArea() {
  // Şimdilik kontrol durumları ve genel mesajlar statik olarak tanımlanıyor
  // Daha sonra bunlar DataContext'ten gelen verilerle dinamik hale getirilecek
  const checks = [
    { id: 'kbs', name: 'KBS Kontrolü', status: 'pending' }, // 'pending', 'completed', 'error'
    { id: 'guestCount', name: 'Kişi Sayısı ', status: 'completed' },
    { id: 'tcPassport', name: 'TC/Pasaport ', status: 'error' },
    { id: 'birthDate', name: 'Doğum Tarihi ', status: 'pending' },
    { id: 'clCa', name: 'CL/CA ', status: 'pending' },
    { id: 'routingComment', name: 'Routing-Comment ', status: 'pending' },
  ];

  const generalMessages = [
    { id: 1, type: 'info', text: 'Program başlatıldı ve kullanıma hazır.' },
    { id: 2, type: 'success', text: 'Inhouse dosyası başarıyla yüklendi: "Inhouse_202507.xml"' },
    { id: 3, type: 'warning', text: 'KBS dosyası yüklenmedi, bazı kontroller yapılamayacak.' },
    { id: 4, type: 'error', text: 'Genel bir hata oluştu: Veritabanı bağlantısı kesildi.' },
    { id: 5, type: 'success', text: 'Polis Raporu dosyası başarıyla yüklendi: "PolisRaporu_Temmuz.xlsx"' },
    { id: 6, type: 'info', text: 'KBS Kontrolü başlatıldı.' },
    { id: 7, type: 'error', text: 'KBS Kontrolü tamamlandı: Oda No 405 için Rate Kodu bulunamadı.' },
    { id: 8, type: 'success', text: 'Kişi Sayısı Kontrolü başarıyla tamamlandı.' },
    { id: 9, type: 'info', text: 'Tüm kontroller tamamlandı.' },
  ];

  // Yardımcı fonksiyon: Kontrol durumuna göre arka plan ve metin rengi ayarlar
  const getCheckStyle = (status) => {
    switch (status) {
      case 'completed':
        return { backgroundColor: '#d4edda', color: '#00ff99' }; // Yeşil tonları
      case 'error':
        return { backgroundColor: '#f8d7da', color: '#bb0000' }; // Kırmızı tonları
      case 'pending':
      default:
        return { backgroundColor: '#e9ecef', color: '#ffffff' }; // Gri/Soluk tonları
    }
  };

  return (
    <Card className="shadow-sm"
      style={{
        minHeight: '475px',        
      }}>
      <Card.Body>
        <Card.Title className="text-success mb-3">
          <i className="bi bi-info-circle-fill me-2"></i> Genel Bilgiler ve Kontrol Durumu
        </Card.Title>

        {/* Kontrol Durumları Bölümü */}
        <h5 className="mb-3 text-primary">Yapılan Kontroller</h5>
        <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
          <Row className="g-2"> {/* Kontroller arasında boşluk ve grid düzeni */}
            {checks.map(check => (
              <Col xs={12} sm={6} md={4} lg={3} key={check.id}> {/* Responsive sütunlar */}
                <Badge
                  pill
                  className="w-100 p-2 d-flex justify-content-center align-items-center"
                  style={getCheckStyle(check.status)} // Duruma göre stil
                >
                  {check.name}
                  {check.status === 'completed' && <i className="bi bi-check-circle-fill ms-2"></i>}
                  {check.status === 'error' && <i className="bi bi-x-circle-fill ms-2"></i>}
                  {check.status === 'pending' && <Spinner animation="border" size="sm" className="ms-2" />}
                </Badge>
              </Col>
            ))}
          </Row>
        </div>

        {/* Genel Bilgi ve Hata Mesajları Bölümü */}
        <h5 className="mb-3 text-secondary">Genel Mesajlar</h5>
        <div
          style={{
            maxHeight: '190px', // Sabit yükseklik, ihtiyaca göre ayarlanabilir
            overflowY: 'auto',   // Dikey kaydırma çubuğu
            paddingRight: '10px'
          }}
          className="general-messages-container"
        >
          <ListGroup variant="flush"> {/* Kenarlıkları olmayan liste */}
            {generalMessages.map(msg => (
              <ListGroup.Item
                key={msg.id}
                className={`d-flex align-items-center ${msg.type === 'error' ? 'text-danger' :
                    msg.type === 'warning' ? 'text-warning' :
                      'text-muted' // Default info veya success için
                  }`}
              >
                {msg.type === 'success' && <i className="bi bi-check-circle-fill me-2 text-success"></i>}
                {msg.type === 'info' && <i className="bi bi-info-circle-fill me-2 text-primary"></i>}
                {msg.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>}
                {msg.type === 'error' && <i className="bi bi-x-circle-fill me-2 text-danger"></i>}
                {msg.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
          {generalMessages.length === 0 && (
            <Alert variant="info" className="mt-3">
              <i className="bi bi-info-circle-fill me-2"></i> Henüz genel bir mesaj bulunmamaktadır.
            </Alert>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default GeneralInfoArea;