import React, { useState, useMemo } from 'react';
import { Card, Table, Spinner, Alert } from 'react-bootstrap';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

function TableSection() {
  // Oda verilerini içeren genişletilmiş dizi
  const initialRoomData = [
    { id: 1, odaNo: 101, isim: 'Ali Yılmaz', raceCode: 'FLRA1', company: 'XYZ Holding', routing: 'Grup 1', rate: 'BB', caCl: 'CA', paraBirimi: 'EUR', comment: 'Özel istekler var', cinDate: '15.07.2025', coutDate: '20.07.2025', balance: 1200, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 600 },
    { id: 2, odaNo: 205, isim: 'Ayşe Demir', raceCode: 'FLRB1', company: 'ABC Ltd.', routing: 'Standart', rate: 'HB', caCl: 'CL', paraBirimi: 'USD', comment: 'Ekstra yatak talep', cinDate: '10.07.2025', coutDate: '17.07.2025', balance: 850, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 450 },
    { id: 3, odaNo: 310, isim: 'Mehmet Kara', raceCode: 'CTL2', company: 'Global Corp', routing: 'Grup 2', rate: 'FB', caCl: 'CA', paraBirimi: 'EUR', comment: '', cinDate: '01.08.2025', coutDate: '08.08.2025', balance: 2100, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1050 },
    { id: 4, odaNo: 402, isim: 'Zeynep Can', raceCode: 'CTL3', company: 'Startup Hub', routing: 'Standart', rate: 'RO', caCl: 'CL', paraBirimi: 'TRY', comment: 'Geç check-out', cinDate: '22.07.2025', coutDate: '25.07.2025', balance: 3500, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1200 },
    { id: 5, odaNo: 501, isim: 'Mustafa Gül', raceCode: 'A02', company: 'Tech Solutions', routing: 'Premium', rate: 'BB', caCl: 'CA', paraBirimi: 'GBP', comment: 'Önemli misafir', cinDate: '05.08.2025', coutDate: '12.08.2025', balance: 1800, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 900 },
    { id: 6, odaNo: 105, isim: 'Ali Yılmaz', raceCode: 'A03', company: 'Yeni Nesil A.Ş.', routing: 'Grup 1', rate: 'RO', caCl: 'CL', paraBirimi: 'TRY', comment: 'Erken giriş talebi', cinDate: '16.07.2025', coutDate: '19.07.2025', balance: 900, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 500 },
    { id: 7, odaNo: 210, isim: 'Ayşe Demir', raceCode: 'COMP', company: 'Dijital Çözümler', routing: 'VIP', rate: 'FB', caCl: 'CA', paraBirimi: 'EUR', comment: 'Özel yemek', cinDate: '11.07.2025', coutDate: '18.07.2025', balance: 1500, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 800 },
    { id: 8, odaNo: 315, isim: 'Mehmet Kara', raceCode: 'RAFB', company: 'Global Corp', routing: 'Standart', rate: 'BB', caCl: 'CL', paraBirimi: 'USD', comment: 'Ekstra hizmetler', cinDate: '02.08.2025', coutDate: '09.08.2025', balance: 1000, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 550 },
    { id: 9, odaNo: 407, isim: 'Zeynep Can', raceCode: 'TURBB', company: 'Finans Grup', routing: 'Acenta', rate: 'HB', caCl: 'CA', paraBirimi: 'TRY', comment: 'Misafir isteği', cinDate: '23.07.2025', coutDate: '26.07.2025', balance: 2800, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1000 },
    { id: 10, odaNo: 505, isim: 'Mustafa Gül', raceCode: 'TURRM', company: 'Bilişim A.Ş.', routing: 'Kurumsal', rate: 'RO', caCl: 'CL', paraBirimi: 'GBP', comment: 'Yarım pansiyon değil', cinDate: '06.08.2025', coutDate: '13.08.2025', balance: 1100, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 700 },
    { id: 11, odaNo: 112, isim: 'Canan Ak', raceCode: 'FLRA1', company: 'Eğitim Vadisi', routing: 'Grup 3', rate: 'FB', caCl: 'CA', paraBirimi: 'EUR', comment: 'Engelli odası', cinDate: '18.07.2025', coutDate: '22.07.2025', balance: 1700, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 850 },
    { id: 12, odaNo: 220, isim: 'Deniz Kaya', raceCode: 'FLRB1', company: 'Lojistik Çöz.', routing: 'Standart', rate: 'BB', caCl: 'CL', paraBirimi: 'USD', comment: '', cinDate: '14.07.2025', coutDate: '21.07.2025', balance: 950, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 500 },
    { id: 13, odaNo: 330, isim: 'Esra Yıldız', raceCode: 'CTL2', company: 'Sağlık Grubu', routing: 'VIP', rate: 'RO', caCl: 'CA', paraBirimi: 'TRY', comment: 'Doktor ziyareti', cinDate: '05.08.2025', coutDate: '10.08.2025', balance: 4200, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1500 },
    { id: 14, odaNo: 440, isim: 'Furkan Çelik', raceCode: 'CTL3', company: 'İnşaat A.Ş.', routing: 'Kurumsal', rate: 'HB', caCl: 'CL', paraBirimi: 'GBP', comment: 'Acil rezervasyon', cinDate: '28.07.2025', coutDate: '01.08.2025', balance: 1600, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 800 },
    { id: 15, odaNo: 550, isim: 'Gizem Aydın', raceCode: 'A02', company: 'Perakende Zinciri', routing: 'Acenta', rate: 'FB', caCl: 'CA', paraBirimi: 'EUR', comment: 'Çocuklu aile', cinDate: '10.08.2025', coutDate: '17.08.2025', balance: 2500, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1250 },
    { id: 16, odaNo: 103, isim: 'Ali Yılmaz', raceCode: 'A03', company: 'XYZ Holding', routing: 'Grup 1', rate: 'FB', caCl: 'CA', paraBirimi: 'EUR', comment: 'Özel istekler var', cinDate: '15.07.2025', coutDate: '20.07.2025', balance: 1300, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 650 },
    { id: 17, odaNo: 208, isim: 'Ayşe Demir', raceCode: 'COMP', company: 'ABC Ltd.', routing: 'VIP', rate: 'BB', caCl: 'CL', paraBirimi: 'USD', comment: 'Ekstra havlu', cinDate: '10.07.2025', coutDate: '17.07.2025', balance: 900, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 480 },
    { id: 18, odaNo: 312, isim: 'Mehmet Kara', raceCode: 'RAFB', company: 'Global Corp', routing: 'Standart', rate: 'RO', caCl: 'CA', paraBirimi: 'EUR', comment: 'Erken check-in', cinDate: '01.08.2025', coutDate: '08.08.2025', balance: 1800, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 900 },
    { id: 19, odaNo: 401, isim: 'Zeynep Can', raceCode: 'TURBB', company: 'Finans Grup', routing: 'Standart', rate: 'BB', caCl: 'CL', paraBirimi: 'TRY', comment: 'Acil durum', cinDate: '22.07.2025', coutDate: '25.07.2025', balance: 3200, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1100 },
    { id: 20, odaNo: 503, isim: 'Mustafa Gül', raceCode: 'TURRM', company: 'Bilişim A.Ş.', routing: 'Premium', rate: 'FB', caCl: 'CA', paraBirimi: 'GBP', comment: 'Yüksek kat', cinDate: '05.08.2025', coutDate: '12.08.2025', balance: 2000, win1: 'Win1 Data', win2: 'Win2 Data', odaDegeri: 1000 },
  ];

  const [data] = useState(initialRoomData);
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      { accessorKey: 'odaNo', header: 'Oda No', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'isim', header: 'İsim', cell: info => info.getValue(), enableSorting: true },
      { 
        accessorKey: 'raceCode', // Yeni sütunumuz
        header: 'Race Code', 
        cell: info => info.getValue(), 
        enableSorting: true // Sıralanabilir
      },
      { accessorKey: 'company', header: 'Company', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'routing', header: 'Routing', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'rate', header: 'Rate', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'caCl', header: 'CA/CL', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'paraBirimi', header: 'Para Birimi', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'comment', header: 'Comment', cell: info => info.getValue(), enableSorting: false },
      { accessorKey: 'cinDate', header: 'C/in Date', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'coutDate', header: 'C/Out Date', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'balance', header: 'Balance', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'win1', header: 'Win1', cell: info => info.getValue(), enableSorting: false },
      { accessorKey: 'win2', header: 'Win2', cell: info => info.getValue(), enableSorting: false },
      { accessorKey: 'odaDegeri', header: 'Oda Değeri', cell: info => info.getValue(), enableSorting: true },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const isLoading = false;
  const hasData = data.length > 0;

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-grid-3x3-gap-fill me-2"></i> Oda Verileri
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center flex-column py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="lead text-primary fw-bold">Oda verileri yükleniyor...</p>
          </div>
        ) : (
          hasData ? (
            <div className="table-responsive">
              <Table striped bordered hover size="sm" className="text-center align-middle">
                <thead className="table-dark">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          colSpan={header.colSpan}
                          style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.isPlaceholder ? null : (
                            <div className="d-flex align-items-center justify-content-center">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <i className="bi bi-arrow-up ms-1"></i>,
                                desc: <i className="bi bi-arrow-down ms-1"></i>,
                              }[header.column.getIsSorted()] ?? null}
                              {header.column.getCanSort() &&
                                !header.column.getIsSorted() && (
                                  <i className="bi bi-arrow-down-up ms-1 text-muted"></i>
                                )}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length}>
                        <Alert variant="info" className="text-center my-3">
                          <i className="bi bi-info-circle-fill me-2"></i> Görüntülenecek oda verisi bulunamadı.
                        </Alert>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle-fill me-2"></i> Görüntülenecek oda verisi bulunamadı. Lütfen dosya yükleyin.
            </Alert>
          )
        )}
      </Card.Body>
    </Card>
  );
}

export default TableSection;