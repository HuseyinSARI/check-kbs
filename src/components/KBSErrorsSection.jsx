// src/components/KBSErrorsSection.jsx
import React, { useState, useMemo, useEffect } from 'react'; // useEffect'i import edin
import { Card, Button, Collapse, Row, Col, Spinner } from 'react-bootstrap';
import { useData } from '../context/DataContext';

function KBSErrorsSection() {
    const [open, setOpen] = useState(true);
    const [hasMounted, setHasMounted] = useState(false); // Yeni state: Bileşenin istemcide monte edilip edilmediğini tutar

    const { 
        kbsErrorsData,  
        checks // checks durumunu DataContext'ten alıyoruz
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

    // KBS/Polis Raporu kontrolünün mevcut durumunu al
    const kbsPoliceReportCheckStatus = checks.find(check => check.id === 'kbs_police_report')?.status;

    // Kapatılan hataları dikkate alarak gerçekte gösterilecek hata sayısı
    const remainingErrorCount = formattedKbsErrors.length;

    // Bu useEffect, bileşen tarayıcıda (istemci tarafında) ilk kez monte edildiğinde çalışır.
    // Bu sayede, sunucu tarafında render edilen HTML ile istemci tarafında React'in "hydration" yaptığı HTML'in
    // tutarlı kalmasını sağlarız. kbsPoliceReportCheckStatus gibi dinamik değerler istemci tarafında stabil hale gelir.
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Eğer bileşen henüz istemcide monte edilmediyse (yani ilk sunucu renderı veya hydration öncesi ise),
    // tutarlı bir placeholder döndürüyoruz.
    if (!hasMounted) {
        return (
            <Card className="mb-4 shadow-lg">
                <Card.Header as="h2" className="bg-danger text-white py-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> KBS Hataları
                </Card.Header>
                <Card.Body>
                    {/* <p> yerine <div> kullanıldı, çünkü <p> içine <div> (Spinner) gelemez */}
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
                        {/* 1. Durum: Dosyalar henüz yüklenmediyse (kontrol pending ise) */}
                        {/* Bu kontrol artık sadece hasMounted true olduktan sonra (istemcide) değerlendirilir. */}
                        {kbsPoliceReportCheckStatus === 'pending' ? (
                            <div className="text-info lead">
                                <Spinner animation="border" size="sm" className="me-2" />
                                **Dosyaların yüklenmesi bekleniyor ve karşılaştırma yapılıyor...**
                            </div>
                        ) : (
                            /* 2. Durum: Kontrol tamamlandıysa */
                            remainingErrorCount === 0 ? (
                                // Kontrol tamamlandı VE gösterilecek hata yoksa (ya hiç yoktu ya da hepsi kapatıldı)
                                <p className="text-success lead">
                                    <i className="bi bi-check-circle-fill me-2"></i> **Harika! Hiçbir KBS hatası bulunamadı veya tüm hatalar giderildi.**
                                </p>
                            ) : (
                                // Kontrol tamamlandı VE gösterilecek hatalar varsa
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
                                                        <strong className="w-100 text-center">Oda No: {error.odaNo}</strong> 
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
                                                            <div style={{ flex: 1, borderRight: '1px solid #eee', paddingRight: '10px' }}>
                                                                <h6 className="text-primary text-center mb-1">KBS</h6>
                                                                <div>
                                                                    {kbsGuestsForDisplay.length > 0 ? (
                                                                        kbsGuestsForDisplay.map((detail, idx) => (
                                                                            <div key={idx} className="mb-2">
                                                                                <small><strong>Ad:</strong> {detail.kbsGuest.ad || '-'}</small><br/>
                                                                                <small><strong>Soyad:</strong> {detail.kbsGuest.soyad || '-'}</small><br/>
                                                                                <small><strong>Belge No:</strong> {detail.kbsGuest.belgeNo || '-'}</small>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <p className="text-muted fst-italic text-center small">KBS verisi yok.</p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div style={{ flex: 1, paddingLeft: '10px' }}>
                                                                <h6 className="text-success text-center mb-1">OPERA</h6>
                                                                <div>
                                                                    {operaGuestsForDisplay.length > 0 ? (
                                                                        operaGuestsForDisplay.map((detail, idx) => (
                                                                            <div key={idx} className="mb-2">
                                                                                <small><strong>Ad:</strong> {detail.operaGuest.ad || '-'}</small><br/>
                                                                                <small><strong>Soyad:</strong> {detail.operaGuest.soyad || '-'}</small><br/>
                                                                                <small><strong>Belge No:</strong> {detail.operaGuest.belgeNo || '-'}</small>
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