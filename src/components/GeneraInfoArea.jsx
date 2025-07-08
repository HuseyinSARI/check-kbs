import React from 'react';
import { Card, Spinner } from 'react-bootstrap';

function GeneralInfoArea() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-success mb-3">İşlem Durumu</Card.Title>
        <div className="d-flex align-items-center justify-content-center flex-column">
          <Spinner animation="border" variant="success" className="mb-3" /> {/* Yükleniyor animasyonu */}
          <p className="lead text-success fw-bold">Durum: Yükleniyor...</p>
          <small className="text-muted">Lütfen bekleyin, dosyanız işleniyor.</small>
          {/* Örnek olarak tamamlanmış durum (gerçek uygulamada dinamik olur) */}
          {/* <p className="lead text-success fw-bold">Durum: İşlem Tamamlandı!</p> */}
        </div>
      </Card.Body>
    </Card>
  );
}

export default GeneralInfoArea;