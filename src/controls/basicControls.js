// src/controls/basicControls.js

/**
 * Inhouse (XML) verisindeki ADULTS + CHILDREN sayısının,
 * odada kayıtlı gerçek isim sayısıyla tutup tutmadığını kontrol eder.
 * * Örnek: XML'de ADULTS="2" CHILDREN="1" yazıyor ama isim listesinde 2 kişi varsa hata verir.
 */
export const checkGuestCountConsistency = (inhouseData) => {
    const errors = [];

    inhouseData.forEach(room => {
        // XML'den gelen sayısal veriler
        const adults = parseInt(room.adults || 0, 10);
        const children = parseInt(room.children|| 0, 10);
        const totalExpected = adults + children;

        // XML içindeki isimleri sayalım: Main Guest (1) + Accompanying (Varsa)
        let actualGuestCount = 0;
        
        
        
            actualGuestCount++;
        

        // Yanındakiler (Accompanying) stringini "/" işaretinden bölüp sayalım
        const accNames = room.accompanyNames;
        if (accNames && typeof accNames === 'string' && accNames.trim().length > 0) {
            const extraGuests = accNames.split('/').filter(name => name.trim().length > 0);
            actualGuestCount += extraGuests.length;
        }

        // Eğer XML'deki sayı ile listedeki isim sayısı tutmuyorsa
        if (actualGuestCount !== totalExpected) {
            errors.push({
                roomNo: room.roomNo,
                type: 'GUEST_COUNT_MISMATCH',
                message: `Kişi Sayısı Uyumsuz: Oda: ${room.roomNo}`,
                severity: 'warning'
            });
        }
    });

    return errors;
};

// Not: Eski checkMissingBirthDates ve checkTcPassportConsistency fonksiyonları 
// polis raporu artık olmadığı için bu dosyadan kaldırılmıştır.