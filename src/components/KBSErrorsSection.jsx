import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

function KBSErrorsSection() {
  const errors = [
    { code: 'E001', description: 'Eksik zorunlu alan: "Kayıt Numarası".', severity: 'danger' },
    { code: 'E002', description: 'Geçersiz tarih formatı: "Başlangıç Tarihi".', severity: 'warning' },
    { code: 'E003', description: 'Bütçe aşımı tespit edildi: Kalem "Donanım".', severity: 'danger' },
    { code: 'E004', description: 'Mükerrer belge numarası bulundu.', severity: 'info' },
    { code: 'W001', description: 'Görsel kalitesi düşük: "Logo.png".', severity: 'secondary' },
  ];

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-danger text-white py-3">
        <i className="bi bi-exclamation-triangle-fill me-2"></i> KBS Hataları
      </Card.Header>
      <Card.Body>
        {errors.length > 0 ? (
          <>
            <p className="text-danger mb-3">Tespit edilen kritik hatalar:</p>
            <ListGroup variant="flush">
              {errors.map((error, index) => (
                <ListGroup.Item key={index} className={`d-flex justify-content-between align-items-start list-group-item-${error.severity}`}>
                  <div>
                    <Badge bg={error.severity} className="me-2">{error.code}</Badge>
                    {error.description}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <p className="mt-4 fw-bold">
              Toplam Tespit Edilen Hata: <span className="text-danger">{errors.length}</span>
            </p>
          </>
        ) : (
          <p className="text-success lead">Hiçbir KBS hatası bulunamadı. Harika!</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default KBSErrorsSection;