import React, { useEffect, useRef } from 'react';
import { Card, Spinner, Row, Col, ListGroup, Badge, Alert } from 'react-bootstrap';
import { useData } from '../context/DataContext';

function GeneralInfoArea() {
    const {
        generalInfoData,
        checks
    } = useData();

    // Mesajları içeren div'e erişim için bir ref oluşturuyoruz
    const messagesEndRef = useRef(null);

    // `generalInfoData.messages` değiştiğinde (yeni bir mesaj geldiğinde) çalışır
    useEffect(() => {
        // Scrollbar'ı en alta kaydırırız
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
        }
    }, [generalInfoData.messages]); // generalInfoData.messages bağımlılığını ekliyoruz

    const allMessages = React.useMemo(() => {
        const messages = generalInfoData.messages && Array.isArray(generalInfoData.messages)
            ? [...generalInfoData.messages]
            : [];
        messages.sort((a, b) => a.id - b.id);
        return messages;
    }, [generalInfoData.messages]);

    const getCheckStyle = (status) => {
        switch (status) {
            case 'completed':
                return { backgroundColor: '#d4edda', color: '#00ff99' };
            case 'error':
                return { backgroundColor: '#f8d7da', color: '#bb0000' };
            case 'pending':
            default:
                return { backgroundColor: '#e9ecef', color: '#ffffff' };
        }
    };

    return (
        <Card className="shadow-sm" style={{ minHeight: '475px' }}>
            <Card.Body>
                <Card.Title className="text-success mb-3">
                    <i className="bi bi-info-circle-fill me-2"></i> Genel Bilgiler ve Kontrol Durumu
                </Card.Title>

                <h5 className="mb-3 text-primary">Yapılan Kontroller</h5>
                <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                    <Row className="g-2">
                        {checks.map(check => (
                            <Col xs={12} sm={6} md={4} lg={3} key={check.id}>
                                <Badge
                                    pill
                                    className="w-100 p-2 d-flex justify-content-center align-items-center"
                                    style={getCheckStyle(check.status)}
                                >
                                    {check.name}
                                    {check.status === 'completed' && <i className="bi bi-check-circle-fill ms-2"></i>}
                                    {check.status === 'error' && <i className="bi bi-x-circle-fill ms-2"></i>}
                                    {check.status === 'pending' && <Spinner animation="border" size="sm" className="ms-2" />}
                                </Badge>
                            </Col>
                        ))}
                    </Row>
                </div>

                <h5 className="mb-3 text-secondary">Mesajlar</h5>
                <div
                    // Referansımızı buraya atıyoruz
                    ref={messagesEndRef}
                    style={{
                        maxHeight: '190px',
                        overflowY: 'auto',
                        paddingRight: '10px'
                    }}
                    className="general-messages-container"
                >
                    <ListGroup variant="flush">
                        {allMessages.length > 0 ? (
                            allMessages.map(msg => (
                                <ListGroup.Item
                                    key={msg.id}
                                    className={`d-flex align-items-center 
                                        ${msg.type === 'error' ? 'text-danger' :
                                            msg.type === 'warning' ? 'text-warning' :
                                            msg.type === 'success' ? 'text-success' :
                                            'text-muted'
                                        }`}
                                >
                                    {msg.type === 'success' && <i className="bi bi-check-circle-fill me-2"></i>}
                                    {msg.type === 'info' && <i className="bi bi-info-circle-fill me-2 text-primary"></i>}
                                    {msg.type === 'warning' && <i className="bi bi-exclamation-triangle-fill me-2"></i>}
                                    {msg.type === 'error' && <i className="bi bi-x-circle-fill me-2"></i>}
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    {msg.text}
                                </ListGroup.Item>
                            ))
                        ) : (
                            <Alert variant="info" className="mt-3">
                                <i className="bi bi-info-circle-fill me-2"></i> Henüz genel bir mesaj bulunmamaktadır.
                            </Alert>
                        )}
                    </ListGroup>
                </div>
            </Card.Body>
        </Card>
    );
}

export default GeneralInfoArea;