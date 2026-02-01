// src/controls/rateControl.js

/**
 * Sayısal değeri temizleyip karşılaştırma için normalize eder.
 * @param {string|number} value 
 * @returns {string}
 */
const normalizePrice = (value) => {
  if (!value) return "";
  // Virgülleri noktaya çevir, rakam ve nokta dışındaki her şeyi sil
  return String(value)
      .replace(/,/g, '.') 
      .replace(/[^0-9.]/g, '');
};

/**
* Tablodaki rate değerinin comment içinde olup olmadığını kontrol eder.
* Nokta/virgül farklılıklarını ve binlik ayırıcıları tolere eder.
*/
const isRateInComment = (rate, comment) => {
  if (!rate || rate === 0 || rate === "0") return true; // Fiyat 0 ise kontrol etme
  if (!comment) return false;

  // 1. Rate'i temizle (Örn: 3405.63)
  const cleanRate = normalizePrice(rate);
  const rateNumber = parseFloat(cleanRate);

  // 2. Comment içindeki sayısal olabilecek her şeyi yakala (3,405.60 gibi yapıları bozmadan)
  // Bu regex; rakam, nokta ve virgül içeren grupları bulur.
  const potentialPrices = comment.match(/[0-9][0-9,.]*/g) || [];

  return potentialPrices.some(priceStr => {
      // Comment içindeki her bir sayı adayını normalize et
      // Eğer sayı binlik ayırıcı (,) içeriyorsa onu temizleyip noktaya çeviriyoruz
      const cleanPriceStr = priceStr.replace(/,/g, ''); 
      const commentPrice = parseFloat(cleanPriceStr);

      // Kuruş farklarını tolere etmek için (Örn: 3405.60 vs 3405.63) 
      // Math.abs kullanarak aradaki fark 1 birimden azsa "tamam" diyoruz.
      // Eğer kuruşu kuruşuna aynı olsun istersen: return commentPrice === rateNumber;
      return Math.abs(commentPrice - rateNumber) < 1; 
  });
};

export const getControlStyles = (rowData) => {
  const { rate, comment, caCl } = rowData;

  let highlightCompanyCell = false;
  let highlightRateCell = false;
  let highlightCommentCell = false;
  let highlightCaClCell = false;

  // --- 1. CA/CL KONTROLÜ ---
  if (caCl === 'CL') {
      highlightCaClCell = true;
  }

  // --- 2. AKILLI RATE & COMMENT UYUMU ---
  // Artık "2 " kontrolü yok. Tüm odalar için rate > 0 ise yorumda aranır.
  if (!isRateInComment(rate, comment)) {
      highlightRateCell = true;
  }

  // Not: Artık havayolları sabitleri kalktığı için highlightCompanyCell 
  // şu anki mantıkta false dönecektir. Özel bir şirket kuralı gelirse buraya eklenebilir.

  return {
      highlightRateCell,
      highlightCommentCell,
      highlightCaClCell,
      highlightCompanyCell
  };
};