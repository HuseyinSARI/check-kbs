// src/components/FileInputArea.jsx
import React from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';

import { useData } from '../context/DataContext';

function FileInputArea({ onFileSelect, isLoading }) {
  const [localError, setLocalError] = React.useState(null);

  const {
    rawInhouseData,
    processedInhouseData,

    rawPolisRaporuData,
    processedPolisRaporuData,

    rawRoutingData,
    processedRoutingData,

    rawCashringData,
    processedCashringData,

    rawKBSData,
    processedKBSData,
    kbsErrorsData,

    addGeneralInfo,
    setProcessedInhouseData
  } = useData();


  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0];
    setLocalError(null);
    if (selectedFile) {
      onFileSelect(selectedFile, fileType); // Aldığı dosyayı ve tipi onFileSelect prop'u aracılığıyla yukarıya iletiyor
    } else {
      setLocalError("Lütfen bir dosya seçin.");
    }
  };

  const handleDebugButtonClick = () => {
    // console.log("Debug butonu tıklandı!");
    // alert("Debug mod aktif! Konsolu kontrol edin.");
    // console.log("İşlenmiş Inhouse Verisi:", processedInhouseData);

    // const updatedData = [...processedInhouseData]; // Mevcut dizinin bir kopyasını oluştur

    // // İlk kaydın adını değiştiriyoruz
    // updatedData[0] = {
    //   ...updatedData[0],
    //   name: "DEĞİŞTİRİLMİŞ İSİM",
    //   comment: "Debug amaçlı değiştirildi"
    // };

    // // Değiştirilmiş veriyi state'e geri yaz
    // setProcessedInhouseData(updatedData);
    // addGeneralInfo('warning', 'Inhouse verisinin ilk kaydı debug amaçlı değiştirildi!');
    // console.log("Inhouse verisi değiştirildi:", updatedData);

    console.log("raw inhouse :", rawInhouseData);
    console.log("işlenmiş inhouse :", processedInhouseData);
    console.log("rawPolisRaporuData :", rawPolisRaporuData);
    console.log("processedPolisRaporuData :", processedPolisRaporuData);
    console.log("rawRoutingData :", rawRoutingData);
    console.log("processedRoutingData :", processedRoutingData);
    console.log("rawCashringData :", rawCashringData);
    console.log("processedCashringData :", processedCashringData);
    console.log("rawKBSData :", rawKBSData);
    console.log("processedKBSData :", processedKBSData);
    console.log("kbsErrorsData :", kbsErrorsData);

  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-primary mb-3">Dosya Yükleme Alanı</Card.Title>
        <Row className="g-3">
          <Col md>
            <Form.Group controlId="formFileInhouse" className="mb-2">
              <Form.Label>Inhouse (gih01103) </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'inhouse')} // Kullanıcı dosya seçtiğinde handleFileChange'i 'inhouse' tipiyle çağırıyor
                accept=".xml"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>

          <Col md>
            <Form.Group controlId="formFileKBS" className="mb-2">
              <Form.Label>KBS </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'kbs')} 
                accept=".xlsx" 
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group controlId="formFilePolice" className="mb-2">
              <Form.Label>Polis Raporu (p2203)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'policeReport')}
                accept=".xml"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group controlId="formFileRouting" className="mb-2">
              <Form.Label>Routing Details (XML)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'routing')} // Aktif hale getirildi
                accept=".xml"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md>
            <Form.Group controlId="formFileCashring" className="mb-2">
              <Form.Label>Cashring (p2009)</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'cashring')} // Aktif hale getirildi
                accept=".xml"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>

          <Col md={12} className="d-flex align-items-end">
            <Button variant="info" className="w-100" onClick={handleDebugButtonClick}>
              Debug Modu
            </Button>
          </Col>
        </Row>

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