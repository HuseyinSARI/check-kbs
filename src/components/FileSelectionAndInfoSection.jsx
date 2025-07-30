// src/components/FileSelectionAndInfoSection.jsx
import React from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap'; 
import FileInputArea from './FileInputArea';
import ErrorDetailsArea from './ErrorDetailsArea'; 
import GeneraInfoArea from './GeneraInfoArea'; 

import { useData } from '../context/DataContext'; 
// handleFileProcessing import'ı artık gerekli değil, kaldırıldı.

function FileSelectionAndInfoSection() {

  // Context'ten handleFileUpload, isProcessing ve uploadError'ı al
  const { handleFileUpload, isProcessing, uploadError } = useData(); // handleFileUpload'ı Context'ten alıyor

  // onFileSelected fonksiyonu artık kullanılmadığı için kaldırıldı.

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-file-earmark-arrow-up-fill me-2"></i> Dosya Yükleme ve Bilgileri
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col md={12}> 
            {/* onFileSelect prop'una doğrudan handleFileUpload'ı iletiyoruz */}
            <FileInputArea onFileSelect={handleFileUpload} isLoading={isProcessing} /> 
          </Col>
          <Col md={6}> 
            <ErrorDetailsArea /> 
          </Col>
          <Col md={6}> 
            <GeneraInfoArea /> 
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FileSelectionAndInfoSection;