import React from 'react';
import { Container } from 'react-bootstrap';
// Kendi oluşturduğumuz bileşenleri import ediyoruz
import FileSelectionAndInfoSection from './components/FileSelectionAndInfoSection';
import KBSErrorsSection from './components/KBSErrorsSection';
import TableSection from './components/TableSection';

function App() {
  return ( 
    // Bootstrap'ın Container bileşeni ile sayfa içeriğini ortalıyor ve boşluk bırakıyoruz
    <Container className="my-5">
      {/* 1. Bölüm */}
      <FileSelectionAndInfoSection />

      {/* 2. Bölüm */}
      <KBSErrorsSection />

      {/* 3. Bölüm */}
      <TableSection />
    </Container>
  );
}

export default App;