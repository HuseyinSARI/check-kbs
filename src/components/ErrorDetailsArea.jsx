import React from 'react';
import { Card } from 'react-bootstrap';

function ErrorDetailsArea() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-info mb-3">Dosya Detayları</Card.Title>
        <p className="text-muted">Seçilen dosyanın bilgileri burada gösterilecek.</p>
        <ul className="list-unstyled"> {/* Bootstrap'ın list-unstyled sınıfı ile liste işaretlerini kaldırırız */}
          <li><strong>Dosya Adı:</strong> <span className="text-break">rapor_verileri_2025_07.xlsx</span></li>
          <li><strong>Boyut:</strong> 1.2 MB</li>
          <li><strong>Tip:</strong> Microsoft Excel Belgesi</li>
          <li><strong>Son Düzenleme:</strong> 05.07.2025</li>
        </ul>
      </Card.Body>
    </Card>
  );
}

export default ErrorDetailsArea;