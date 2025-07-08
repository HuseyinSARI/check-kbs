import React from 'react';
import { Card, Form, Button } from 'react-bootstrap';

function FileInputArea() {
  return (
    <Card className="shadow-sm"> {/* Hafif gölge ekler */}
      <Card.Body>
        <Card.Title className="text-primary mb-3">Dosya Seçimi</Card.Title>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Lütfen bir dosya seçin:</Form.Label>
          <Form.Control type="file" />
        </Form.Group>
        <Button variant="primary" className="w-100">Dosyayı Yükle</Button>
      </Card.Body>
    </Card>
  );
}

export default FileInputArea; 