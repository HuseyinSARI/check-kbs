// src/controls/mainControls.js
import { useEffect } from 'react';
import { useData } from '../context/DataContext'; // DataContext'ten useData hook'unu alıyoruz
import { compareKBSAndPoliceReportData } from './kbsOperaCompare'; // Hata karşılaştırma fonksiyonunu alıyoruz
import { checkMissingBirthDates } from './basicControls'; // YENİ: Doğum tarihi kontrol fonksiyonu

/**
 * useMainControls Hook'u:
 * KBS ve Polis Raporu verileri yüklendiğinde hata karşılaştırma mantığını tetikler.
 * Ayrıca genel bilgi mesajları ekler.
 */
export const useMainControls = () => {
    // DataContext'ten gerekli state'leri ve setter'ları alıyoruz
    const {
        processedKBSData,
        processedPolisRaporuData,
        setGeneralOperaErrorsData, // YENİ: generalOperaErrorsData'yı güncellemek için

        setKbsErrorsData,
        addGeneralInfo,
        updateCheckStatus
    } = useData();

    // KBS ve Polis Raporu verileri her değiştiğinde bu useEffect çalışacak
    useEffect(() => {
        // Her iki dosyanın da yüklendiğinden ve boş olmadığından emin ol
        if (processedKBSData.length > 0 && processedPolisRaporuData.length > 0) {
            // console.log("KBS ve Polis Raporu verileri yüklendi. Hata kontrolü başlatılıyor...");
            // addGeneralInfo('info', 'KBS ve Polis Raporu verileri yüklendi, karşılaştırma yapılıyor...', 'system');

            const errors = compareKBSAndPoliceReportData(processedKBSData, processedPolisRaporuData);
            setKbsErrorsData(errors); // Hataları DataContext'e kaydediyoruz

            // Hatalı misafir sayısını daha kısa yoldan hesapla
            const totalErrorGuestCount = Object.values(errors).flat().reduce((count, errorDetail) => {
                // Her hata detayında kbsGuest veya operaGuest varsa sayacı artır
                return count + (errorDetail.kbsGuest ? 1 : 0) + (errorDetail.operaGuest ? 1 : 0);
            }, 0);
            if (Object.keys(errors).length === 0) {
                addGeneralInfo('success', 'KBS ve Polis Raporu arasında hiçbir uyumsuzluk bulunamadı. Harika!', 'system');
            } else {
                addGeneralInfo(
                    'warning',
                    `KBS/Opera uyumsuzluğu için ${Object.keys(errors).length} oda ve ${totalErrorGuestCount} hatalı misafir verisi bulundu.`,
                    'system'
                );
            }

            updateCheckStatus('kbs_police_report', 'completed');
        }

        // --- Doğum Tarihi Boş Kontrolü (Polis Raporu için) ---
        if (processedPolisRaporuData.length > 0) {
            const birthDateErrors = checkMissingBirthDates(processedPolisRaporuData);
            setGeneralOperaErrorsData(birthDateErrors); // Hataları generalOperaErrorsData'ya kaydet

            if (birthDateErrors.length > 0) {
                addGeneralInfo(
                    'warning',
                    `Polis Raporu'nda ${birthDateErrors.length} misafir için boş doğum tarihi bulundu.`,
                    'system'
                );
                updateCheckStatus('birth_date_check', 'error'); 
            } else {
                addGeneralInfo(
                    'success',
                    'Polis Raporu\'nda boş doğum tarihi hatası bulunamadı.',
                    'system'
                );
            }
            updateCheckStatus('birth_date_check', 'completed'); 
        }
        // Eğer polis raporu verisi henüz yüklenmediyse, durumu 'pending' olarak bırak
        else {
            updateCheckStatus('birth_date_check', 'pending');
        }
        // Not: Sadece bir dosya yüklendiğinde uyarı vermek isterseniz buraya 'else if' ekleyebilirsiniz.
        // else if (processedKBSData.length > 0 || processedPolisRaporuData.length > 0) {
        //     addGeneralInfo('info', 'KBS veya Polis Raporu dosyası yüklendi, diğer dosya bekleniyor...', 'system');
        // }
    }, [
        processedKBSData,
        processedPolisRaporuData,
        setKbsErrorsData,
        setGeneralOperaErrorsData,
        addGeneralInfo]); // Bağımlılıklar
};