import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, Alert, OverlayTrigger, Popover, Badge } from 'react-bootstrap';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

import { useData } from '../context/DataContext';
import { processMainTable } from '../utils/processMainTable';
import { getControlStyles } from '../controls/rateControl';

const initialSorting = [{ id: 'rateCode', desc: false }, { id: 'company', desc: false }];

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
        cell: info => info.getValue() 
      },
      {
        accessorKey: 'routing',
        header: 'Routing',
        cell: info => {
          const val = info.getValue();
          if (!val) return "-";
          
          const entries = val.split('||');
          return (
            <div className="d-flex flex-column gap-2 align-items-start">
              {entries.map((entry, idx) => {
                const [mainInfo, board, method] = entry.split('|');
                return (
                  <div key={idx} className="d-flex align-items-center flex-wrap" style={{ gap: '4px' }}>
                    {/* Ana Bilgi: Pill içinde değil, düz metin */}
                    <span className="fw-semibold text-dark" style={{ fontSize: '0.85rem' }}>
                      {mainInfo}
                    </span>
                    
                    {/* Sadece Teknik Detaylar Pill içinde */}
                    {board && (
                      <Badge bg="secondary" pill style={{ fontSize: '0.65rem', padding: '0.35em 0.65em' }}>
                        {board}
                      </Badge>
                    )}
                    {method && (
                      <Badge bg="danger" pill style={{ fontSize: '0.65rem', padding: '0.35em 0.65em' }}>
                        {method}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
      },
      {
        accessorKey: 'routedFrom',
        header: 'From',
        cell: info => {
          const rawValue = info.getValue();
          if (!rawValue) return "-";
          const names = rawValue.split(',').filter(n => n.trim() !== "");
          const popover = (
            <Popover id={`popover-${info.row.id}`}>
              <Popover.Header as="h3" className="bg-info text-white py-2" style={{fontSize: '0.85rem'}}>Detay</Popover.Header>
              <Popover.Body className="p-0">
                <div className="list-group list-group-flush">
                  {names.map((name, i) => (<div key={i} className="list-group-item small py-1">{name}</div>))}
                </div>
              </Popover.Body>
            </Popover>
          );
          return (
            <OverlayTrigger trigger="click" rootClose placement="top" overlay={popover}>
              <Badge bg="info" style={{ cursor: 'pointer' }}>{names.length} Oda</Badge>
            </OverlayTrigger>
          );
        }
      },
      { accessorKey: 'caCl', header: 'CA/CL', cell: info => info.getValue() },
      { accessorKey: 'paraBirimi', header: 'Para', cell: info => info.getValue() },
      { accessorKey: 'rate', header: 'Rate', cell: info => info.getValue() },
      { 
        accessorKey: 'comment', 
        header: 'Comment', 
        cell: info => <div style={{ minWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{info.getValue()}</div> 
      },
      { accessorKey: 'cinDate', header: 'C/in', cell: info => info.getValue() },
      { accessorKey: 'coutDate', header: 'C/out', cell: info => info.getValue() },
    ];

    if (Object.keys(processedCashringData).length > 0) {
      baseColumns.push(
        { accessorKey: 'balance', header: 'Balance', cell: info => info.getValue() },
        { accessorKey: 'win1', header: 'Win1', cell: info => <div className="fw-bold">{info.getValue()?.cashringValue}</div> },
        { accessorKey: 'win2', header: 'Win2', cell: info => <div className="fw-bold">{info.getValue()?.cashringValue}</div> },
        { accessorKey: 'odaDegeri', header: 'Oda Değeri', cell: info => info.getValue() }
      );
    }
    return baseColumns;
  }, [processedCashringData]);

  const table = useReactTable({ 
    data, 
    columns, 
    state: { sorting }, 
    onSortingChange: setSorting, 
    getCoreRowModel: getCoreRowModel(), 
    getSortedRowModel: getSortedRowModel() 
  });

  return (
    <Card className="mb-4 shadow-lg">
      <Card.Header as="h2" className="bg-primary text-white py-3">
        <i className="bi bi-grid-3x3-gap-fill me-2"></i> Oda Verileri
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table striped bordered hover size="sm" className="mb-0">
            <thead className="table-dark">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} style={{ cursor: 'pointer', textAlign: 'left' }}>
                      <div className="d-flex align-items-center">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted()] ?? null}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => {
                const styles = getControlStyles(row.original);
                return (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => {
                      let bg = {};
                      if (cell.column.id === 'company' && styles.highlightCompanyCell) bg.backgroundColor = '#ff6347';
                      if (cell.column.id === 'comment' && styles.highlightCommentCell) bg.backgroundColor = '#fff3cd';
                      if (cell.column.id === 'caCl' && styles.highlightCaClCell) bg.backgroundColor = '#90E0EF';
                      if (cell.column.id === 'rate' && styles.highlightRateCell) bg.backgroundColor = '#ff6347';
                      
                      return (
                        <td key={cell.id} style={{ ...bg, textAlign: 'left' }} className="align-middle small py-2">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default TableSection;