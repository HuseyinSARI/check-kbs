import React from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap'; // Row, Col eklendi
import { useData } from '../context/DataContext'; // isLoading durumunu kullanmak için

function FileInputArea({ onFileSelect }) { // onFileSelect prop'unu al
  const { isLoading } = useData(); // Global loading state'ini kullan
  const [localError, setLocalError] = React.useState(null);

  // Dosya seçildiğinde üst bileşene haber ver
  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0];
    setLocalError(null); // Hataları temizle
    if (selectedFile) {
      onFileSelect(selectedFile, fileType); // Üst bileşene dosyayı ve tipini gönder
    } else {
      setLocalError("Lütfen bir dosya seçin.");
    }
  };

  // Debug butonu için ayrı bir handler
  const handleDebugButtonClick = () => {
    console.log("Debug butonu tıklandı!");
    // Burada geliştirme veya test amaçlı ek işlemler yapabilirsin
    // Örneğin, mock verileri yüklemek, state'i kontrol etmek vb.
    alert("Debug mod aktif! Konsolu kontrol edin.");
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-primary mb-3">Dosya Yükleme Alanı</Card.Title>
        <Row className="g-3"> {/* Butonlar arası boşluk ve responsive düzen */}
          {/* Inhouse Dosyası */}
          <Col md>
            <Form.Group controlId="formFileInhouse" className="mb-2">
              <Form.Label>Inhouse (gih01103) </Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 'inhouse')} accept=".xml" />
            </Form.Group>
          </Col>

          <Col md>
            <Form.Group controlId="formFileKBS" className="mb-2">
              <Form.Label>KBS  </Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 'kbs')} accept=".xlsx" />
            </Form.Group>
          </Col>
          {/* KBS Dosyası */}

          {/* Polis Raporu Dosyası */}
          <Col md>
            <Form.Group controlId="formFilePolice" className="mb-2">
              <Form.Label>Polis Raporu (p2203)</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 'policeReport')} accept=".xml" />
            </Form.Group>
          </Col>

          {/* Routing Dosyası */}
          <Col md>
            <Form.Group controlId="formFileRouting" className="mb-2">
              <Form.Label>Routing Details (XML)</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 'routing')} accept=".xml" />
            </Form.Group>
          </Col>

          {/* Casting Dosyası */}
          <Col md>
            <Form.Group controlId="formFileCashring" className="mb-2">
              <Form.Label>Cashring (p2009)</Form.Label>
              <Form.Control type="file" onChange={(e) => handleFileChange(e, 'cashring')} accept=".xml" />
            </Form.Group>
          </Col>
          
          {/* Debug Butonu */}
          <Col md={12} className="d-flex align-items-end"> {/* Butonu alt hizalamak için */}
             <Button variant="info" className="w-100" onClick={handleDebugButtonClick}>
               Debug Modu
             </Button>
          </Col>
        </Row>

        {/* Hata ve Yükleme Durumu */}
        {localError && <Alert variant="danger" className="mt-3">{localError}</Alert>}
        {isLoading && (
          <div className="d-flex justify-content-center align-items-center mt-3">
            <Spinner animation="border" variant="primary" className="me-2" size="sm" />
            <span>Dosya İşleniyor...</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default FileInputArea;