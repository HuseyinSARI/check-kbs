// src/controls/basicControls.js

// Bu dosya bir hook içermeyecek. Sadece bir fonksiyon olarak kullanılacak.

/**
 * checkMissingBirthDates:
 * Polis Raporu verisindeki her misafiri kontrol ederek doğum tarihi boş olanları bulur.
 *
 * @param {Array} polisRaporuData - İşlenmiş Polis Raporu verileri (misafir listesi).
 * @returns {Array} - Bulunan boş doğum tarihi hatalarının listesi.
 */
export const checkMissingBirthDates = (polisRaporuData) => {
    const errors = [];
    
    if (!polisRaporuData || polisRaporuData.length === 0) {
        return errors; // Veri yoksa boş dizi döndür
    }

    polisRaporuData.forEach(guest => {
        // 'dogumTarihi' alanı boşsa veya sadece boşluklardan oluşuyorsa
        if (!guest.birthDate || String(guest.birthDate).trim() === '') {
            errors.push({
                type: 'MISSING_BIRTH_DATE',
                message: `Oda No: ${guest.roomNo || '-'}, Misafir: ${guest.firstName || '-'} ${guest.lastName || '-' } için doğum tarihi boş.`
                // Diğer ilgili misafir bilgileri buraya eklenebilir
            });
        }
    });

    return errors;
};