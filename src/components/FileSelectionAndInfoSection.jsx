import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import FileInputArea from './FileInputArea';
import ErrorDetailsArea from './ErrorDetailsArea';
import GeneraInfoArea from './GeneraInfoArea';

import { useData } from '../context/DataContext'; // DataContext'i kullanmak için
import { handleFileProcessing } from '../utils/processFileData'; // Yeni işleme fonksiyonu


function FileSelectionAndInfoSection() {

  const dataContext = useData(); // DataContext'i bir obje olarak al

  // FileInputArea'dan dosya seçildiğinde çağrılacak handler
  const onFileSelected = (file, fileType) => {
    // console.log(`Dosya seçildi: ${file.name}, Tipi: ${fileType}`);
    handleFileProcessing(file, fileType, dataContext); // İşleme fonksiyonunu çağır
  };

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-file-earmark-arrow-up-fill me-2"></i> Dosya Yükleme ve Bilgileri
      </Card.Header>
      <Card.Body>
        <Row className="g-4">
          <Col md={12}> {/* Daha geniş bir alan verelim */}
            {/* onFileSelect prop'unu FileInputArea'ya iletiyoruz */}
            <FileInputArea onFileSelect={onFileSelected} />
          </Col>
          <Col md={6}> {/* Tüm satırı kaplasın */}
            <ErrorDetailsArea />
          </Col>
          <Col md={6}> {/* Tüm satırı kaplasın */}
            <GeneraInfoArea />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default FileSelectionAndInfoSection;