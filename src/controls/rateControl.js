// src/controls/rateControl.js

/**
 * Bir satırdaki verilere göre renklendirme koşullarını döndürür.
 * @param {object} rowData - Tablo satırına ait orijinal veri nesnesi.
 * @returns {object} - Hangi hücrelerin boyanması gerektiğini belirten koşul nesnesi.
 */
export const getControlStyles = (rowData) => {
    const { rate, comment, caCl } = rowData;
    
    // Comment'in "2 " ile başlayıp başlamadığı kontrolü
    const highlightCommentCell = comment && comment.startsWith("2 ");
    
    // CA/ CL'nin "CL" olup olmadığı kontrolü
    const highlightCaClCell = caCl === 'CL';
  
    // Rate ve Comment uyumsuzluğu kontrolü
    let highlightRateCell = false;
    if (comment && !comment.startsWith("2 ")) {
      // Virgül veya nokta ile ayrılmış sayıları bulmak için regex kullan
      const commentMatch = comment.match(/^(\d+([,.]\d+)?)/);
      if (commentMatch) {
        const commentNumber = parseFloat(commentMatch[1].replace(',', '.'));
        const rateNumber = parseFloat(String(rate).replace(',', '.'));
        
        highlightRateCell = rateNumber !== commentNumber;
      }
    }
    
    return {
      highlightRateCell,
      highlightCommentCell,
      highlightCaClCell
    };
  };