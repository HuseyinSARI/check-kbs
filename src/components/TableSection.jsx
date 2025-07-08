import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

function TableSection() {
  const data = [
    { id: 1, itemName: 'Personel Giderleri', quantity: '₺150.000', status: 'Onaylandı', statusVariant: 'success' },
    { id: 2, itemName: 'Ofis Malzemeleri', quantity: '₺5.000', status: 'Beklemede', statusVariant: 'warning' },
    { id: 3, itemName: 'Yazılım Lisansları', quantity: '₺25.000', status: 'Tamamlandı', statusVariant: 'primary' },
    { id: 4, itemName: 'Seyahat Harcamaları', quantity: '₺7.500', status: 'İptal Edildi', statusVariant: 'danger' },
    { id: 5, itemName: 'Eğitim Giderleri', quantity: '₺12.000', status: 'Revize Edildi', statusVariant: 'info' },
  ];

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-success text-white py-3">
        <i className="bi bi-table me-2"></i> Rapor Tablosu
      </Card.Header>
      <Card.Body>
        <p className="mb-4">İşlenmiş verilerin ve raporların detaylı görünümü:</p>
        <Table striped bordered hover responsive className="text-center"> {/* Tabloya hizalama ekledim */}
          <thead className="table-dark"> {/* Başlık satırını koyu yapar */}
            <tr>
              <th>#ID</th>
              <th>Kalem Adı</th>
              <th>Miktar</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="text-start">{row.itemName}</td> {/* Kalem adını sola hizala */}
                <td>{row.quantity}</td>
                <td>
                  <Badge bg={row.statusVariant} className="py-2 px-3 rounded-pill">
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default TableSection;