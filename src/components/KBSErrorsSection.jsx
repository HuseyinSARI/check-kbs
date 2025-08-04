// src/components/KBSErrorsSection.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Collapse, Row, Col, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

function KBSErrorsSection() {
    const [open, setOpen] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    const { 
        kbsErrorsData,  
        checks
    } = useData();

    const [dismissedErrors, setDismissedErrors] = useState(new Set());

    const formattedKbsErrors = useMemo(() => {
        const errorsList = [];
        let idCounter = 0; 

        Object.entries(kbsErrorsData).forEach(([roomNo, errorsInRoom]) => {
            errorsList.push({
                id: idCounter++,
                odaNo: roomNo.toUpperCase(), 
                errorDetails: errorsInRoom 
            });
        });
        
        return errorsList.filter(error => !dismissedErrors.has(error.id));
    }, [kbsErrorsData, dismissedErrors]);

    const handleDeleteKbsError = (idToRemove) => {
        setDismissedErrors(prev => new Set(prev).add(idToRemove));
    };

    const kbsPoliceReportCheckStatus = checks.find(check => check.id === 'kbs_police_report')?.status;
    const remainingErrorCount = formattedKbsErrors.length;

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return (
            <Card className="mb-4 shadow-lg">
                <Card.Header as="h2" className="bg-danger text-white py-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> KBS Hataları
                </Card.Header>
                <Card.Body>
                    <div className="text-info lead">Yükleniyor...</div> 
                </Card.Body>
            </Card>
        );
    }

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
                        {kbsPoliceReportCheckStatus === 'pending' ? (
                            <div className="text-info lead">
                                <Spinner animation="border" size="sm" className="me-2" />
                                **Dosyaların yüklenmesi bekleniyor ve karşılaştırma yapılıyor...**
                            </div>
                        ) : (
                            remainingErrorCount === 0 ? (
                                <p className="text-success lead">
                                    <i className="bi bi-check-circle-fill me-2"></i> **Harika! Hiçbir KBS hatası bulunamadı veya tüm hatalar giderildi.**
                                </p>
                            ) : (
                                <Row className="g-3">
                                    {formattedKbsErrors.map((error) => {
                                        const kbsGuestsForDisplay = error.errorDetails.filter(
                                            detail => detail.kbsGuest && (detail.source === 'KBS' || detail.type === 'DETAIL_MISMATCH')
                                        );
                                        const operaGuestsForDisplay = error.errorDetails.filter(
                                            detail => detail.operaGuest && (detail.source === 'OPERA' || detail.type === 'DETAIL_MISMATCH')
                                        );

                                        return (
                                            <Col sm={4} md={3} key={error.id}>
                                                <Card className="shadow-sm border-danger h-100">
                                                    <Card.Header className="bg-danger text-white py-2 d-flex justify-content-between align-items-center">
                                                        <strong className="w-100 text-center fs-4">Oda No: {error.odaNo}</strong> 
                                                        <Button
                                                            variant="link"
                                                            className="text-white p-0 position-absolute end-0 me-2" 
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
                                                        <div className="d-flex"> 
                                                            <div style={{ flex: 1, paddingRight: '10px' }}>
                                                                <h6 className="text-primary text-center mb-1">KBS</h6>
                                                                <div>
                                                                    {kbsGuestsForDisplay.length > 0 ? (
                                                                        kbsGuestsForDisplay.map((detail, idx) => (
                                                                            <div key={idx} className="mb-2">
                                                                                <small><strong>Ad:</strong> {detail.kbsGuest.ad || '-'}</small><br/>
                                                                                <small><strong>Soyad:</strong> {detail.kbsGuest.soyad || '-'}</small><br/>
                                                                                <small><strong>Belge No:</strong> {detail.kbsGuest.belgeNo || '-'}</small>
                                                                                {/* Son misafirden sonra çizgi eklememek için kontrol yapıldı */}
                                                                                {idx < kbsGuestsForDisplay.length - 1 && <hr className="my-1" />}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-muted fst-italic text-center small">KBS verisi yok.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Dikey bölücü çizgi */}
                                                            <div className="vr mx-2"></div>
                                                            
                                                            <div style={{ flex: 1, paddingLeft: '10px' }}>
                                                                <h6 className="text-success text-center mb-1">OPERA</h6>
                                                                <div>
                                                                    {operaGuestsForDisplay.length > 0 ? (
                                                                        operaGuestsForDisplay.map((detail, idx) => (
                                                                            <div key={idx} className="mb-2">
                                                                                <small><strong>Ad:</strong> {detail.operaGuest.ad || '-'}</small><br/>
                                                                                <small><strong>Soyad:</strong> {detail.operaGuest.soyad || '-'}</small><br/>
                                                                                <small><strong>Belge No:</strong> {detail.operaGuest.belgeNo || '-'}</small>
                                                                                {/* Son misafirden sonra çizgi eklememek için kontrol yapıldı */}
                                                                                {idx < operaGuestsForDisplay.length - 1 && <hr className="my-1" />}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-muted fst-italic text-center small">OPERA verisi yok.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            )
                        )}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
}

export default KBSErrorsSection;