// src/components/FileInputArea.jsx
import React from 'react';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';

import { useData } from '../context/DataContext';

const DEBUG_CLICK_THRESHOLD = 5;

function FileInputArea({ onFileSelect, isLoading }) {
  const [localError, setLocalError] = React.useState(null);
  const [debugClickCount, setDebugClickCount] = React.useState(0);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const { width, height } = useWindowSize();

  const {
    rawInhouseData,
    processedInhouseData,
    rawPolisRaporuData,
    processedPolisRaporuData,
    rawRoutingData,
    processedRoutingData,
    rawCashringData,
    processedCashringData,
    mainTableData,
    rawKBSData,
    processedKBSData,
    kbsErrorsData,
    generalOperaErrorsData,
    addGeneralInfo,
    setProcessedInhouseData
  } = useData();

  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0];
    setLocalError(null);
    if (selectedFile) {
      onFileSelect(selectedFile, fileType);
    } else {
      setLocalError("Lütfen bir dosya seçin.");
    }
  };

  const handleDebugButtonClick = () => {
    const newCount = debugClickCount + 1;
    setDebugClickCount(newCount);

    if (newCount >= DEBUG_CLICK_THRESHOLD) {
      setShowConfetti(true);
      setDebugClickCount(0);
      setTimeout(() => {
        setShowConfetti(false);
      }, 20000);
    }

    console.log("raw inhouse :", rawInhouseData);
    console.log("rawKBSData :", rawKBSData);
    console.log("rawPolisRaporuData :", rawPolisRaporuData);
    console.log("rawRoutingData :", rawRoutingData);
    console.log("rawCashringData :", rawCashringData);
    console.log("processedInhouseData :", processedInhouseData);
    console.log("processedKBSData :", processedKBSData);
    console.log("processedPolisRaporuData :", processedPolisRaporuData);
    console.log("processedRoutingData :", processedRoutingData);
    console.log("processedCashringData :", processedCashringData);
    console.log("kbsErrorsData :", kbsErrorsData);
    console.log("generalOperaErrorsData :", generalOperaErrorsData);
    console.log("mainTableData :", mainTableData);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            // Kalp parçacıkları için özel ayarlar
            // Aşağıdan yukarıya değil, yukarıdan aşağıya akması için
            confettiSource={{ x: 0, y: -20, w: width, h: height * 0.1 }}
            colors={['#ff729f', '#ffc0cb', '#f25088']} // Pembe tonları
            // Kalp şeklini oluşturmak için bir render fonksiyonu
            // Bu kısım confettinin şeklini değiştirir
            drawShape={ctx => {
              const x = 0;
              const y = 0;
              const width = 50;
              const height = 50;

              ctx.moveTo(x + width / 2, y + height / 4);
              ctx.bezierCurveTo(x + width, y, x + width, y + height / 2, x + width / 2, y + height);
              ctx.bezierCurveTo(x, y + height / 2, x, y, x + width / 2, y + height / 4);
              ctx.closePath();
              ctx.fill();
            }}
          />
        )}
        <Card.Title className="text-primary mb-3">Dosya Yükleme Alanı</Card.Title>
        <Row className="g-3">
          <Col md>
            <Form.Group controlId="formFileInhouse" className="mb-2">
              <Form.Label>Inhouse (gih01103) </Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => handleFileChange(e, 'inhouse')}
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
                onChange={(e) => handleFileChange(e, 'routing')}
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
                onChange={(e) => handleFileChange(e, 'cashring')}
                accept=".xml"
                disabled={isLoading}
              />
            </Form.Group>
          </Col>
          <Col md={12} className="d-flex align-items-end">
            <Button
              variant="info"
              className="w-100 position-relative"
              onClick={handleDebugButtonClick}
            >
              Debug Modu
              {debugClickCount > 0 && debugClickCount < DEBUG_CLICK_THRESHOLD && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{ fontSize: '1rem', padding: '0.4em 0.7em' }}
                >
                  {DEBUG_CLICK_THRESHOLD - debugClickCount}
                </span>
              )}
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