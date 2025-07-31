import React from 'react';
import { Card, Spinner, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap'; // Yeni bileşenleri import ettik
import { useData } from '../context/DataContext'; // DataContext'i import ettik


function GeneralInfoArea() {

  const {
    generalInfoData,
    checks
  } = useData();

  // Şimdilik kontrol durumları ve genel mesajlar statik olarak tanımlanıyor
  // Daha sonra bunlar DataContext'ten gelen verilerle dinamik hale getirilecek
 

  // Sadece generalInfoData.messages'ı gösteriyoruz
  const allMessages = React.useMemo(() => {
    // generalInfoData içindeki 'messages' dizisi (addGeneralMessage tarafından eklenenler)
    const messages = generalInfoData.messages && Array.isArray(generalInfoData.messages)
      ? [...generalInfoData.messages]
      : [];

    // Mesajları zamana göre sırala (en yeni en altta)
    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return messages;
  }, [generalInfoData.messages]);


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

        {/* Genel Bilgi ve Mesajlar Bölümü */}
        <h5 className="mb-3 text-secondary">Mesajlar</h5>
        <div
          style={{
            maxHeight: '190px', // Orijinal yüksekliğe geri döndürüldü
            overflowY: 'auto',
            paddingRight: '10px'
          }}
          className="general-messages-container"
        >
          <ListGroup variant="flush">
            {allMessages.length > 0 ? (
              allMessages.map(msg => (
                <ListGroup.Item
                  key={msg.id}
                  className={`d-flex align-items-center 
                    ${msg.type === 'error' ? 'text-danger' :
                      msg.type === 'warning' ? 'text-warning' :
                        msg.type === 'success' ? 'text-success' :
                          'text-muted'
                    }`}
                >
                  {msg.type === 'success' && <i className="bi bi-check-circle-fill me-2"></i>}
                  {msg.type === 'info' && <i className="bi bi-info-circle-fill me-2 text-primary"></i>}
                  {msg.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                  {msg.type === 'error' && <i className="bi bi-x-circle-fill me-2"></i>}
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  {msg.text}
                </ListGroup.Item>
              ))
            ) : (
              <Alert variant="info" className="mt-3">
                <i className="bi bi-info-circle-fill me-2"></i> Henüz genel bir mesaj bulunmamaktadır.
              </Alert>
            )}
          </ListGroup>

        </div>
      </Card.Body>
    </Card>
  );
}

export default GeneralInfoArea;