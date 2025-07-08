import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import FileInputArea from './FileInputArea';
import ErrorDetailsArea from './ErrorDetailsArea';
import GeneraInfoArea from './GeneraInfoArea';

function FileSelectionAndInfoSection() {
  return (
    <Card className="mb-4 shadow-lg"> {/* Daha belirgin bir gölge */}
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-file-earmark-arrow-up-fill me-2"></i> Dosya Yükleme ve Bilgileri
      </Card.Header>
      <Card.Body>
        <Row className="g-4"> {/* Alt bileşenler arasında boşluk bırakır */}
          <Col md={4}>
            <FileInputArea />
          </Col>
          <Col md={4}>
            <ErrorDetailsArea />
          </Col>
          <Col md={4}>
            <GeneraInfoArea />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FileSelectionAndInfoSection;