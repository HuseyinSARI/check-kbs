// src/controls/mainControls.js
import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { compareKBSAndPoliceReportData } from './kbsOperaCompare';
import {
    checkMissingBirthDates,
    checkGuestCountConsistency,
    checkTcPassportConsistency
} from './basicControls';

/**
 * useMainControls Hook'u:
 * Yüklenen verilerde çeşitli kontrolleri tetikler ve sonuçları DataContext'e yazar.
 * 
 */

//  TODO: YAPILACAK KONTROLLER LİSTESİ
        //  doğum tarihi boşmu dolumu                                  ok
        //  kişi sayısı doğru mu ayarlanmı                             ok
        //  3 lü girilen commentlerin hepsi aynı mı             
        //  kbs-opeara uyumlu mu                                       ok
        //  commnette yazan rate ile gerçek rate aynı mı
        //  pasaport pas-tc doğru mu girilmiş                          ok
        //  pasaport pas-tc kısmı boş mu                               ok
        //  pas - tr - uyruk doğru mu girilmiş                         ok
        //  ekip commetleri doğru mu
        //  compary veya agent girilen kişiye routing yapılmışmı
        //  peristera-extert-abh ler CL-mi
        //  pegasus-sunexp  routingli olanlar CL mi
        //  
export const useMainControls = () => {
    const {
        processedKBSData,
        processedPolisRaporuData,
        processedInhouseData,
        setGeneralOperaErrorsData,
        setKbsErrorsData,
        addGeneralInfo,
        updateCheckStatus,
        generalInfoData,
        checks // checks state'ini bağımlılık olarak kullanacağız
    } = useData();

    // Kontrol mesajlarının tekrar gönderilmesini önlemek için bir useRef kullanıyoruz
    const sentMessagesRef = useRef({});

    // Mesajın zaten gönderilip gönderilmediğini kontrol eden yardımcı fonksiyon
    const hasInfoMessage = (type, text) => generalInfoData.messages.some(msg => msg.type === type && msg.text === text);


    // Tüm kontrolleri tek bir useEffect içinde yönetelim
    useEffect(() => {
        // Kontrol durumlarını tutmak için geçici bir nesne
        const newChecksStatus = {};

        // --- Kontrol 1: KBS ve Polis Raporu Veri Karşılaştırması ---
        if (processedKBSData.length > 0 && processedPolisRaporuData.length > 0) {
            const kbsComparisonErrors = compareKBSAndPoliceReportData(processedKBSData, processedPolisRaporuData);
            setKbsErrorsData(kbsComparisonErrors);

            const totalErrorGuestCount = Object.values(kbsComparisonErrors).flat().reduce((count, errorDetail) => {
                return count + (errorDetail.kbsGuest ? 1 : 0) + (errorDetail.operaGuest ? 1 : 0);
            }, 0);

            const successMessage = 'KBS ve Polis Raporu arasında hiçbir uyumsuzluk bulunamadı. Harika!';
            const warningMessage = `KBS/Opera uyumsuzluğu için ${Object.keys(kbsComparisonErrors).length} oda ve ${totalErrorGuestCount} hatalı misafir verisi bulundu.`;

            if (Object.keys(kbsComparisonErrors).length === 0) {
                if (!sentMessagesRef.current[successMessage]) {
                    addGeneralInfo('success', successMessage, 'system');
                    sentMessagesRef.current[successMessage] = true;
                }
            } else {
                if (!sentMessagesRef.current[warningMessage]) {
                    addGeneralInfo('warning', warningMessage, 'system');
                    sentMessagesRef.current[warningMessage] = true;
                }
            }
            newChecksStatus['kbs_police_report'] = 'completed';
        } else {
            newChecksStatus['kbs_police_report'] = 'pending';
        }

        // --- Kontrol 2: Doğum Tarihi Boş Kontrolü ---
        if (processedPolisRaporuData.length > 0) {
            const birthDateErrors = checkMissingBirthDates(processedPolisRaporuData);

            // Hataları biriktiriyoruz
            setGeneralOperaErrorsData(prevErrors => {
                const otherErrors = prevErrors.filter(e => e.type !== 'MISSING_BIRTH_DATE');
                return [...otherErrors, ...birthDateErrors];
            });

            const successMessage = 'Polis Raporu\'nda boş doğum tarihi hatası bulunamadı.';
            const warningMessage = `Polis Raporu'nda ${birthDateErrors.length} misafir için boş doğum tarihi bulundu.`;

            if (birthDateErrors.length > 0) {
                if (!sentMessagesRef.current[warningMessage]) {
                    addGeneralInfo('warning', warningMessage, 'system');
                    sentMessagesRef.current[warningMessage] = true;
                }
            } else {
                if (!sentMessagesRef.current[successMessage]) {
                    addGeneralInfo('success', successMessage, 'system');
                    sentMessagesRef.current[successMessage] = true;
                }
            }
            newChecksStatus['birth_date_check'] = 'completed';
        } else {
            newChecksStatus['birth_date_check'] = 'pending';
            setGeneralOperaErrorsData(prevErrors => prevErrors.filter(e => e.type !== 'MISSING_BIRTH_DATE'));
        }

        // --- Kontrol 3: Inhouse Kişi Sayısı Tutarlılık Kontrolü ---
        if (processedInhouseData.length > 0) {
            const guestCountErrors = checkGuestCountConsistency(processedInhouseData);

            // Hataları biriktiriyoruz
            setGeneralOperaErrorsData(prevErrors => {
                const otherErrors = prevErrors.filter(e => e.type !== 'GUEST_COUNT_MISMATCH');
                return [...otherErrors, ...guestCountErrors];
            });

            const successMessage = 'Inhouse dosyasında kişi sayısı tutarsızlığı bulunamadı.';
            const warningMessage = `Inhouse dosyasında ${guestCountErrors.length} oda için kişi sayısı tutarsızlığı bulundu.`;

            if (guestCountErrors.length > 0) {
                if (!sentMessagesRef.current[warningMessage]) {
                    addGeneralInfo('warning', warningMessage, 'system');
                    sentMessagesRef.current[warningMessage] = true;
                }
            } else {
                if (!sentMessagesRef.current[successMessage]) {
                    addGeneralInfo('success', successMessage, 'system');
                    sentMessagesRef.current[successMessage] = true;
                }
            }
            newChecksStatus['guestCount'] = 'completed';
        } else {
            newChecksStatus['guestCount'] = 'pending';
            setGeneralOperaErrorsData(prevErrors => prevErrors.filter(e => e.type !== 'GUEST_COUNT_MISMATCH'));
        }

        // --- Kontrol 4: TC/Pasaport Tutarlılık Kontrolü ---
        if (processedPolisRaporuData.length > 0) {
            const tcPassportErrors = checkTcPassportConsistency(processedPolisRaporuData);

            // Hataları biriktiriyoruz
            setGeneralOperaErrorsData(prevErrors => {
                const otherErrors = prevErrors.filter(e => !e.type.startsWith('TC_') && !e.type.startsWith('PAS_') && e.type !== 'MISSING_BELGENO' && e.type !== 'MISSING_BELGETURU' && e.type !== 'MISSING_IKAMET_ADRESI' && e.type !== 'MISSING_UYRUK');
                return [...otherErrors, ...tcPassportErrors];
            });

            const successMessage = 'TC/Pasaport kontrollerinde herhangi bir sorun bulunamadı.';
            const warningMessage = `TC/Pasaport kontrollerinde ${tcPassportErrors.length} hata bulundu.`;

            if (tcPassportErrors.length > 0) {
                if (!hasInfoMessage('warning', warningMessage)) {
                    addGeneralInfo('warning', warningMessage, 'system');
                    sentMessagesRef.current[warningMessage] = true;
                }
            } else {
                if (!hasInfoMessage('success', successMessage)) {
                    addGeneralInfo('success', successMessage, 'system');
                    sentMessagesRef.current[successMessage] = true;
                }
            }
            newChecksStatus['tcPassport'] = 'completed';
        } else {
            newChecksStatus['tcPassport'] = 'pending';
            // Eğer veri yoksa ilgili hataları temizle
            setGeneralOperaErrorsData(prevErrors => prevErrors.filter(e => !e.type.startsWith('TC_') && !e.type.startsWith('PAS_') && e.type !== 'MISSING_BELGENO' && e.type !== 'MISSING_BELGETURU' && e.type !== 'MISSING_IKAMET_ADRESI' && e.type !== 'MISSING_UYRUK'));
        }

        // Son olarak, tüm kontrol durumlarını birleştirip tek bir çağrıyla güncelle
        const checksToUpdate = Object.keys(newChecksStatus);
        checksToUpdate.forEach(checkId => {
            const currentStatus = checks.find(c => c.id === checkId)?.status;
            if (currentStatus !== newChecksStatus[checkId]) {
                updateCheckStatus(checkId, newChecksStatus[checkId]);
            }
        });

    }, [
        processedKBSData,
        processedPolisRaporuData,
        processedInhouseData,
        setKbsErrorsData,
        setGeneralOperaErrorsData,
        addGeneralInfo,
        checks, // Artık `checks` state'ini bağımlılık olarak kullanıyoruz
        generalInfoData // Bağımlılık olarak kalmalı
    ]);
};