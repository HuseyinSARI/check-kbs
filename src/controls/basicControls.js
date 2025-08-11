// src/controls/basicControls.js

import { v4 as uuidv4 } from 'uuid';

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
                message: `Oda No: ${guest.roomNo || '-'}, Misafir: ${guest.firstName || '-'} ${guest.lastName || '-' } için doğum tarihi boş.`,
                // Yeni: Oda numarasını ayrı bir özellik olarak ekle
                roomNo: guest.roomNo || '-' 
            });
        }
    });

    return errors;
};


/**
 * checkGuestCountConsistency:
 * Inhouse verisindeki rezervasyonlarda beyan edilen kişi sayısı ile
 * isim listesindeki (name ve accompanyNames) kişi sayısının tutarlılığını kontrol eder.
 *
 * @param {Array} processedInhouseData - İşlenmiş Inhouse.txt verileri.
 * @returns {Array} - Bulunan kişi sayısı uyuşmazlığı hatalarının listesi.
 */
export const checkGuestCountConsistency = (processedInhouseData) => {
    const errors = [];

    if (!processedInhouseData || processedInhouseData.length === 0) {
        return errors; // Veri yoksa boş dizi döndür
    }
    
    processedInhouseData.forEach(guest => {
        // Rezervasyonda belirtilen toplam kişi sayısı (adults + children)
        const declaredGuestCount = (guest.adults || 0) + (guest.children || 0);

        // accompanyNames alanındaki kişi sayısını bulma
        let accompaniedGuestCount = 0;
        if (guest.accompanyNames && typeof guest.accompanyNames === 'string' && guest.accompanyNames.trim() !== '') {
            const accompaniedNames = guest.accompanyNames.split('/').map(name => name.trim()).filter(name => name !== '');
            accompaniedGuestCount = accompaniedNames.length;
        }

        // Toplam isim sayısı (name + accompanyNames)
        // name alanı her zaman tek bir kişi olduğu için 1 ekliyoruz.
        const totalNamedGuests = 1 + accompaniedGuestCount;

        // Beyan edilen kişi sayısı ile isim sayısı uyuşmuyor mu?
        if (declaredGuestCount !== totalNamedGuests) {
            errors.push({
                id: `guestcount-error-${guest.roomNo}-${guest.name}-${Date.now()}-${Math.random()}`,
                type: 'GUEST_COUNT_MISMATCH',
                message: `Oda No: ${guest.roomNo || '-'} için kişi sayısı uyuşmuyor.`,
                // Yeni: Oda numarasını ayrı bir özellik olarak ekle
                roomNo: guest.roomNo || '-' 
            });
        }
    });

    return errors;
};


/**
 * Polis Raporu verisindeki TC/Pasaport bilgilerini kontrol eder.
 * @param {Array<Object>} processedPolisRaporuData - İşlenmiş Polis Raporu verisi.
 * @returns {Array<Object>} Bulunan hataların listesi.
 */
export const checkTcPassportConsistency = (processedPolisRaporuData) => {
    const errors = [];

    // Verilerin boş olup olmadığını kontrol et
    if (!processedPolisRaporuData || processedPolisRaporuData.length === 0) {
        return errors;
    }

    processedPolisRaporuData.forEach(guest => {
        const guestName = `${guest.firstName} ${guest.lastName}`;
        
        // Kontrol 1, 2, 3, 4: Boş alan kontrolü
        if (!guest.belgeNo) {
            errors.push({ id: uuidv4(), type: 'MISSING_BELGENO', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belge no boş.`, guest, roomNo: guest.roomNo });
        }
        if (!guest.belgeTuru) {
            errors.push({ id: uuidv4(), type: 'MISSING_BELGETURU', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belge türü boş.`, guest, roomNo: guest.roomNo });
        }
        if (!guest.ikametAdresi) {
            errors.push({ id: uuidv4(), type: 'MISSING_IKAMET_ADRESI', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için ikamet adresi boş.`, guest, roomNo: guest.roomNo });
        }
        if (!guest.uyruk) {
            errors.push({ id: uuidv4(), type: 'MISSING_UYRUK', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için uyruk boş.`, guest, roomNo: guest.roomNo });
        }

        // Eğer temel alanlar eksikse, detaylı kontrolleri atla
        if (!guest.belgeTuru || !guest.belgeNo || !guest.uyruk || !guest.ikametAdresi) {
            return;
        }

        // Kontrol 5, 6, 7: Belge türü "TCKN" olanlar için
        if (guest.belgeTuru === 'TCKN') {
            const isTc = guest.belgeNo.length === 11 && !isNaN(guest.belgeNo);
            const startsWith9x = guest.belgeNo.startsWith('99') || guest.belgeNo.startsWith('98') || guest.belgeNo.startsWith('97');

            // Kontrol 5: Belge Türü TCKN ise uyruk TC olmalı
            if (guest.uyruk.toUpperCase() !== 'TC') {
                errors.push({ id: uuidv4(), type: 'TC_UYRUK_MISMATCH', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belgeTuru TCKN iken uyruk TC değil.`, guest, roomNo: guest.roomNo });
            }

            // Kontrol 6: Belge Türü TCKN ise ikamet adresi Turkey olmalı
            if (guest.ikametAdresi.toUpperCase() !== 'TURKEY') {
                errors.push({ id: uuidv4(), type: 'TC_IKAMET_MISMATCH', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belgeTuru TCKN iken ikamet adresi Turkey değil.`, guest, roomNo: guest.roomNo });
            }

            // Kontrol 7 & 10: BelgeNo 11 haneli ve sayı mı?
            if (!isTc) {
                // Eğer 9x ile başlamıyorsa ve 11 hane değilse hata ver
                if (!startsWith9x) {
                    errors.push({ id: uuidv4(), type: 'TC_BELGENO_INVALID', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için TCKN numarası 11 hane ve sayı olmalı.`, guest, roomNo: guest.roomNo });
                }
            } else if (startsWith9x && isTc) {
                // Kontrol 10: TCKN 97,98,99 ile başlıyorsa ve 11 haneli sayıysa, BelgeTuru PAS olmalıydı
                 errors.push({ id: uuidv4(), type: 'TCKN_9X_WARNING', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belgeNo 9x ile başlıyor, bu TCKN yerine Pasaport olabilir.`, guest, roomNo: guest.roomNo });
            }
        }
        
        // Kontrol 8, 9: Belge türü "PAS" olanlar için
        if (guest.belgeTuru === 'PAS') {
            // Kontrol 8: Pasaport ise uyruk TC olamaz
            if (guest.uyruk.toUpperCase() === 'TC') {
                errors.push({ id: uuidv4(), type: 'PAS_UYRUK_TC', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belgeTuru PAS iken uyruk TC.`, guest, roomNo: guest.roomNo });
            }
            // Kontrol 9: Pasaport ise ikamet adresi Turkey olamaz
            if (guest.ikametAdresi.toUpperCase() === 'TURKEY') {
                errors.push({ id: uuidv4(), type: 'PAS_IKAMET_TURKEY', message: `Oda No: ${guest.roomNo}, Misafir: ${guestName} için belgeTuru PAS iken ikamet adresi Turkey değil.`, guest, roomNo: guest.roomNo });
            }
        }
    });

    return errors;
};