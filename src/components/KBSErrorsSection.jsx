import React, { useState } from 'react';
import { Card, Button, Collapse, Row, Col, ListGroup } from 'react-bootstrap';

function KBSErrorsSection() {
  const [open, setOpen] = useState(true);

  const [kbsErrors, setKbsErrors] = useState([
    {
      id: 1,
      odaNo: 101,
      kbsData: [{ ad: "Burak", soyad: "Yılmaz", belgeNo: "KBS123" }],
      operaData: [{ ad: "Burak", soyad: "Yılmaz", belgeNo: "OPR123" }],
    },
    {
      id: 2,
      odaNo: 213,
      kbsData: [{ ad: "Ayşe", soyad: "Demir", belgeNo: "KBS456" }],
      operaData: [],
    },
    {
      id: 3,
      odaNo: 510,
      kbsData: [{ ad: "Ali Kemal", soyad: "Can", belgeNo: "KBS789" }],
      operaData: [{ ad: "Ali Kemal", soyad: "Can", belgeNo: "OPR789" }],
    },
    {
      id: 4,
      odaNo: 813,
      kbsData: [],
      operaData: [{ ad: "Fuat", soyad: "Mavi", belgeNo: "OPR012" }],
    },
    {
      id: 5,
      odaNo: 823,
      kbsData: [{ ad: "Elif", soyad: "Kara", belgeNo: "KBS345" }],
      operaData: [{ ad: "Elif", soyad: "Kara", belgeNo: "OPR345" }],
    },
    {
      id: 6,
      odaNo: 920,
      kbsData: [{ ad: "Zeynep", soyad: "Ak", belgeNo: "KBS678" }],
      operaData: [{ ad: "Zeynep", soyad: "Ak", belgeNo: "OPR678" }],
    },
    {
      id: 7,
      odaNo: 303,
      kbsData: [{ ad: "Canan", soyad: "Yıldız", belgeNo: "KBS999" }],
      operaData: [
        { ad: "Canan", soyad: "Yıldız", belgeNo: "OPR999" },
        { ad: "Ahmet", soyad: "Gül", belgeNo: "OPR888" }
      ],
    },
  ]);

  const handleDeleteKbsError = (idToRemove) => {
    const updatedErrors = kbsErrors.filter(error => error.id !== idToRemove);
    setKbsErrors(updatedErrors);
  };

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header 
        as="h2" 
        className="bg-danger text-white py-3 d-flex justify-content-between align-items-center"
        onClick={() => setOpen(!open)}
        aria-controls="kbs-errors-collapse-text"
        aria-expanded={open}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i> KBS Hataları
        </div>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'} ms-auto`}></i>
      </Card.Header>
      
      <Collapse in={open}>
        <div id="kbs-errors-collapse-text">
          <Card.Body>
            {kbsErrors.length > 0 ? (
              <Row className="g-3">
                {kbsErrors.map((error) => (
                  <Col sm={4} md={3} key={error.id}>
                    <Card className="shadow-sm border-danger h-100">
                      <Card.Header className="bg-danger text-white py-2 d-flex justify-content-between align-items-center">
                        {/* Oda No başlığını ortalıyoruz */}
                        <strong className="w-100 text-center">Oda No: {error.odaNo}</strong> 
                        <Button
                          variant="link"
                          className="text-white p-0 position-absolute end-0 me-2" // Butonun konumunu sağ üst köşeye alıyoruz
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteKbsError(error.id);
                          }}
                          aria-label={`Oda No ${error.odaNo} hatasını sil`}
                        >
                          <i className="bi bi-x-circle-fill fs-5"></i>
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          {/* KBS Verileri Alanı */}
                          <Col md={6} className="border-end">
                            {/* KBS alt başlığını ortalıyoruz */}
                            <h6 className="text-primary mb-3 text-center">KBS</h6> 
                            {error.kbsData && error.kbsData.length > 0 ? (
                              <ListGroup variant="flush">
                                {error.kbsData.map((data, idx) => (
                                  <ListGroup.Item key={idx} className="border-0 pb-0 pt-0">
                                    <small><strong>Ad:</strong> {data.ad || '-'}</small><br/>
                                    <small><strong>Soyad:</strong> {data.soyad || '-'}</small><br/>
                                    <small><strong>Belge No:</strong> {data.belgeNo || '-'}</small>
                                    {idx < error.kbsData.length - 1 && <hr className="my-2"/>}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted fst-italic text-center">KBS verisi bulunamadı.</p>
                            )}
                          </Col>

                          {/* OPERA Verileri Alanı */}
                          <Col md={6}>
                            {/* OPERA alt başlığını ortalıyoruz */}
                            <h6 className="text-success mb-3 text-center">OPERA</h6> 
                            {error.operaData && error.operaData.length > 0 ? (
                              <ListGroup variant="flush">
                                {error.operaData.map((data, idx) => (
                                  <ListGroup.Item key={idx} className="border-0 pb-0 pt-0">
                                    <small><strong>Ad:</strong> {data.ad || '-'}</small><br/>
                                    <small><strong>Soyad:</strong> {data.soyad || '-'}</small><br/>
                                    <small><strong>Belge No:</strong> {data.belgeNo || '-'}</small>
                                    {idx < error.operaData.length - 1 && <hr className="my-2"/>}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <p className="text-muted fst-italic text-center">OPERA verisi bulunamadı.</p>
                            )}
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <p className="text-success lead">
                <i className="bi bi-check-circle-fill me-2"></i> Harika! Hiçbir KBS hatası bulunamadı.
              </p>
            )}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}

export default KBSErrorsSection;