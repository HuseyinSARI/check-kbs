// src/components/TableSection.js

import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Alert } from 'react-bootstrap';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { useData } from '../context/DataContext';
import { processMainTable } from '../utils/processMainTable';
import { getControlStyles } from '../controls/rateControl'; // Yeni kontrol dosyasını içeri aktardık

// Tek satırlık metinler için stil nesnesi
const singleLineEllipsisStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

// Sabit genişlikteki sütunlar için stil nesnesi
const fixedWidthStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '50px',
  textAlign: 'center',
};

// Başlangıç sıralama durumunu tanımlıyoruz
const initialSorting = [
  { id: 'rateCode', desc: false },
  { id: 'company', desc: false },
  { id: 'cinDate', desc: false },
];

function TableSection() {
  const {
    processedInhouseData,
    processedRoutingData,
    processedCashringData,
    setMainTableData,
    mainTableData,
  } = useData();

  const [sorting, setSorting] = useState(initialSorting);

  useEffect(() => {
    if (processedInhouseData && processedInhouseData.length > 0) {
      const newMainTableData = processMainTable(
        processedInhouseData,
        processedRoutingData,
        processedCashringData
      );
      setMainTableData(newMainTableData);
    } else {
      setMainTableData([]);
    }
  }, [processedInhouseData, processedRoutingData, processedCashringData, setMainTableData]);

  const data = useMemo(() => mainTableData, [mainTableData]);

  const columns = useMemo(() => {
    let baseColumns = [
      { accessorKey: 'roomNo', header: 'Oda No', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'name', header: 'İsim', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'rateCode', header: 'Rate Code', cell: info => info.getValue(), enableSorting: true },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: info => <div style={singleLineEllipsisStyle}>{info.getValue()}</div>,
        enableSorting: true,
      },
      {
        accessorKey: 'routing',
        header: 'Routing',
        cell: info => <div style={singleLineEllipsisStyle}>{info.getValue()}</div>,
        enableSorting: true,
      },
      {
        accessorKey: 'caCl',
        header: 'CA/ CL',
        cell: info => <div style={fixedWidthStyle}>{info.getValue()}</div>,
        enableSorting: true,
      },
      {
        accessorKey: 'paraBirimi',
        header: 'Para Brmi',
        cell: info => <div style={fixedWidthStyle}>{info.getValue()}</div>,
        enableSorting: true,
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: info => info.getValue(),
        enableSorting: true
      },
      { accessorKey: 'comment', header: 'Comment', cell: info => info.getValue(), enableSorting: false },
      { accessorKey: 'cinDate', header: 'C/in Date', cell: info => info.getValue(), enableSorting: true },
      { accessorKey: 'coutDate', header: 'C/Out Date', cell: info => info.getValue(), enableSorting: true },
    ];

    const hasCashringData = Object.keys(processedCashringData).length > 0;

    if (hasCashringData) {
      baseColumns = [
        ...baseColumns,
        { accessorKey: 'balance', header: 'Balance', cell: info => info.getValue(), enableSorting: true },
        { accessorKey: 'win1', header: 'Win1', cell: info => info.getValue(), enableSorting: false },
        { accessorKey: 'win2', header: 'Win2', cell: info => info.getValue(), enableSorting: false },
        { accessorKey: 'odaDegeri', header: 'Oda Değeri', cell: info => info.getValue(), enableSorting: true },
      ];
    }

    return baseColumns;
  }, [processedCashringData]);

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

  const hasData = data.length > 0;

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-grid-3x3-gap-fill me-2"></i> Oda Verileri
      </Card.Header>
      <Card.Body>
        {hasData ? (
          <div className="table-responsive">
            <Table striped bordered hover size="sm" className="">
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
                  table.getRowModel().rows.map(row => {
                    const rowData = row.original;
                    // Tüm renklendirme koşullarını tek bir yerden al
                    const { 
                      highlightRateCell, 
                      highlightCommentCell, 
                      highlightCaClCell,
                      highlightCompanyCell 
                    } = getControlStyles(rowData);

                    return (
                      <tr key={row.id}>
                        {row.getVisibleCells().map(cell => {
                          let cellStyle = {};

                          // Koşullara göre stili ata
                          if (cell.column.id === 'company' && highlightCompanyCell) {
                            cellStyle.backgroundColor = '#ff6347'; // Parlak kırmızı
                          }

                          if (cell.column.id === 'comment' && highlightCommentCell) {
                            cellStyle.backgroundColor = '#fff3cd';
                          }

                          if (cell.column.id === 'caCl' && highlightCaClCell) {
                            cellStyle.backgroundColor = '#90E0EF';
                          }

                          if (cell.column.id === 'rate' && highlightRateCell) {
                            cellStyle.backgroundColor = '#ff6347'; // Parlak kırmızı
                          }
                          return (
                            <td key={cell.id} style={cellStyle}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
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
        )}
      </Card.Body>
    </Card>
  );
}

export default TableSection;