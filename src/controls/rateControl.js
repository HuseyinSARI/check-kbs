// src/controls/rateControl.js

// Gunes Ekspres Hava için geçerli özel koşullar.
const GUNES_EXPRESS_RATE_CONDITIONS = {
  rateCode: 'A02',
  company: 'Gunes Ekspres Hava',
  rate: 156.8
};

// Pegasus Hava Taşımacılığı için geçerli özel koşullar.
const PEGASUS_RATE_CONDITIONS = {
  rateCode: 'A03',
  company: 'Pegasus Hava Tasim',
  rate: 108.86
};

// Türk Hava Yolları için geçerli özel koşullar.
const THY_RATE_CONDITIONS = {
  rateCode: 'A0SYTHY',
  company: 'Turk Hava Yollari',
  rate: 6330
};

/**
* Bir satırdaki verilere göre renklendirme koşullarını döndürür.
* @param {object} rowData - Tablo satırına ait orijinal veri nesnesi.
* @returns {object} - Hangi hücrelerin boyanması gerektiğini belirten koşul nesnesi.
*/
export const getControlStyles = (rowData) => {
  const { rate, comment, caCl, rateCode, company } = rowData;
  
  // Varsayılan olarak tüm hücreler için hata yok kabul edilir.
  let highlightCompanyCell = false;
  let highlightRateCell = false;
  let highlightCommentCell = false;
  let highlightCaClCell = false;
  
  // --- GENEL KONTROLLER: Tüm odalar için geçerli ---
  
  // Comment'in "2 " ile başlayıp başlamadığı kontrolü
  if (comment && comment.startsWith("2 ")) {
      highlightCommentCell = true;
  }

  // CA/ CL'nin "CL" olup olmadığı kontrolü
  if (caCl === 'CL') {
      highlightCaClCell = true;
  }

  // Rate ve Comment uyumsuzluğu kontrolü
  if (comment && !comment.startsWith("2 ")) {
      const commentMatch = comment.match(/^(\d+([,.]\d+)?)/);
      if (commentMatch) {
          const commentNumber = parseFloat(commentMatch[1].replace(',', '.'));
          const rateNumber = parseFloat(String(rate).replace(',', '.'));
          
          if (rateNumber !== commentNumber) {
              highlightRateCell = true;
          }
      }
  }
  
  // --- EKSTRA KONTROLLER: Özel rateCode'lar için geçerli ---
  // Bu kontroller, yukarıdaki genel kontrollerle birlikte çalışır.
  
  // Gunes Ekspres koşulu
  if (rateCode === GUNES_EXPRESS_RATE_CONDITIONS.rateCode) {
      if (company !== GUNES_EXPRESS_RATE_CONDITIONS.company) {
          highlightCompanyCell = true;
      }

      const currentRate = parseFloat(String(rate).replace(',', '.'));
      if (currentRate !== GUNES_EXPRESS_RATE_CONDITIONS.rate) {
          highlightRateCell = true;
      }
  }
  
  // Pegasus koşulu
  if (rateCode === PEGASUS_RATE_CONDITIONS.rateCode) {
      if (company !== PEGASUS_RATE_CONDITIONS.company) {
          highlightCompanyCell = true;
      }

      const currentRate = parseFloat(String(rate).replace(',', '.'));
      if (currentRate !== PEGASUS_RATE_CONDITIONS.rate) {
          highlightRateCell = true;
      }
  }
  
  // Türk Hava Yolları koşulu
  if (rateCode === THY_RATE_CONDITIONS.rateCode) {
      if (company !== THY_RATE_CONDITIONS.company) {
          highlightCompanyCell = true;
      }

      const currentRate = parseFloat(String(rate).replace(',', '.'));
      if (currentRate !== THY_RATE_CONDITIONS.rate) {
          highlightRateCell = true;
      }
  }

  return {
      highlightRateCell,
      highlightCommentCell,
      highlightCaClCell,
      highlightCompanyCell
  };
};