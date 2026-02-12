import React, { useState, useMemo, useEffect } from 'react';
import { Card, Table, OverlayTrigger, Popover, Badge } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';

import { useData } from '../context/DataContext';
import { processMainTable } from '../utils/processMainTable';
import { getControlStyles } from '../controls/rateControl';

const initialSorting = [{ id: 'rateCode', desc: false }];

function TableSection() {
  const { processedInhouseData, processedRoutingData, setMainTableData, mainTableData } = useData();
  const [sorting, setSorting] = useState(initialSorting);

  useEffect(() => {
    if (processedInhouseData && processedInhouseData.length > 0) {
      // Artık cashringData parametresini göndermiyoruz
      setMainTableData(processMainTable(processedInhouseData, processedRoutingData));
    } else {
      setMainTableData([]);
    }
  }, [processedInhouseData, processedRoutingData, setMainTableData]);

  const columns = useMemo(() => [
    { accessorKey: 'roomNo', header: 'Oda No' },
    { accessorKey: 'name', header: 'İsim' },
    { accessorKey: 'pax', header: 'Kişi' },
    { accessorKey: 'rateCode', header: 'Rate Code' },
    { accessorKey: 'company', header: 'Company' },
    {
      accessorKey: 'routing',
      header: 'Routing',
      cell: info => {
        const val = info.getValue();
        if (!val) return "-";
        return (
          <div className="d-flex flex-column gap-2 align-items-start text-start">
            {val.split('||').map((entry, idx) => {
              const [rRoom, rName, rBoard, rMethod] = entry.split('|');
              const isCL = rMethod && rMethod.toUpperCase() === 'CL';
              return (
                <div key={idx} className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                  {rRoom && <Badge bg="dark">{rRoom}</Badge>}
                  <span className="fw-semibold text-dark">{rName}</span>
                  {rBoard && <Badge bg="secondary" pill>{rBoard}</Badge>}
                  {rMethod && (
                    <Badge pill style={{ 
                      backgroundColor: isCL ? '#ffc107' : '#dc3545', 
                      color: isCL ? '#000' : '#fff',
                      fontWeight: 'bold',
                      border: isCL ? '1px solid #e0a800' : 'none'
                    }}>
                      {rMethod}
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
        const val = info.getValue();
        if (!val) return "-";
        const names = val.split(',').filter(n => n.trim() !== "");
        const popover = (
          <Popover id={`popover-${info.row.id}`}>
            <Popover.Header as="h3" className="bg-info text-white py-2">Detay</Popover.Header>
            <Popover.Body className="p-0">
              <div className="list-group list-group-flush">
                {names.map((name, i) => (<div key={i} className="list-group-item py-1">{name}</div>))}
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
    { accessorKey: 'caCl', header: 'CA/CL' },
    { accessorKey: 'paraBirimi', header: 'Para' },
    { accessorKey: 'rate', header: 'Rate' },
    { 
      accessorKey: 'comment', 
      header: 'Comment', 
      cell: info => <div style={{ minWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{info.getValue()}</div> 
    },
    { 
      accessorKey: 'balance', 
      header: 'Balance',
      cell: info => <span className="fw-bold text-danger">{info.getValue()}</span> 
    },
    { accessorKey: 'cinDate', header: 'C/in' },
    { accessorKey: 'coutDate', header: 'C/out' },
  ], []);

  const table = useReactTable({ data: mainTableData, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <Card className="mb-4 shadow-lg text-start">
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
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()} style={{ cursor: 'pointer' }} className="py-2 px-2 text-start">
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
                      if (cell.column.id === 'rate' && styles.highlightRateCell) bg.backgroundColor = '#ff6347';
                      return (
                        <td key={cell.id} style={{ ...bg }} className="align-middle py-2 px-2 text-start">
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