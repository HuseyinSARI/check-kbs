// src/controls/mainControls.js
import { useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { compareKBSAndPoliceReportData } from './kbsOperaCompare';
import { checkGuestCountConsistency } from './basicControls';
import { checkRoutingComments } from './checkRoutingComments';

export const useMainControls = () => {
    const {
        processedKBSData,
        processedInhouseData,
        processedRoutingData,
        setGeneralOperaErrorsData,
        processedPolisRaporuData,
        setKbsErrorsData,
        addGeneralInfo,
        updateCheckStatus,
        checks
    } = useData();

    const sentMessagesRef = useRef({});

    useEffect(() => {
        const newChecksStatus = {};

        // 1. İSİM VE ODA KONTROLÜ
        if (processedKBSData.length > 0 && processedInhouseData.length > 0) {
            const kbsErrors = compareKBSAndPoliceReportData(processedKBSData, processedInhouseData);
            setKbsErrorsData(kbsErrors);

            const errorCount = Object.keys(kbsErrors).length;
            const msg = errorCount === 0 ? '🥳 İsim ve Oda eşleşmeleri mükemmel!' : `⚠️ ${errorCount} odada isim uyumsuzluğu var.`;

            if (!sentMessagesRef.current[msg]) {
                addGeneralInfo(errorCount === 0 ? 'info' : 'warning', msg, 'system');
                sentMessagesRef.current[msg] = true;
            }
            newChecksStatus['kbs_police_report'] = 'completed';
        }

        // 2. KİŞİ SAYISI KONTROLÜ
        if (processedInhouseData.length > 0) {
            const countErrors = checkGuestCountConsistency(processedInhouseData);
            setGeneralOperaErrorsData(prev => [
                ...prev.filter(e => e.type !== 'GUEST_COUNT_MISMATCH'),
                ...countErrors
            ]);
            newChecksStatus['guestCount'] = 'completed';
        }

        // 3. ROUTING YORUM KONTROLÜ
        if (processedInhouseData.length > 0 && processedRoutingData.length > 0) {
            const routeErrors = checkRoutingComments(processedInhouseData, processedRoutingData);
            setGeneralOperaErrorsData(prev => [
                ...prev.filter(e => e.type !== 'ROUTING_COMMENT_MISMATCH'),
                ...routeErrors
            ]);
        }

        // 4. POLİS RAPORU EKSİK VERİ KONTROLÜ 
        if (processedPolisRaporuData && processedPolisRaporuData.length > 0) {
            const missingDataErrors = [];

            processedPolisRaporuData.forEach(guest => {
                const isBirthDateMissing = !guest.birthDate || guest.birthDate.trim() === "";
                const isBelgeNoMissing = !guest.belgeNo || guest.belgeNo.trim() === "";

                if (isBirthDateMissing || isBelgeNoMissing) {
                    let missingFields = [];
                    if (isBirthDateMissing) missingFields.push("Doğum Tarihi");
                    if (isBelgeNoMissing) missingFields.push("Belge No");

                    missingDataErrors.push({
                        id: `missing-${guest.roomNo}-${guest.firstName}`,
                        type: 'MISSING_POLICE_DATA',
                        roomNo: guest.roomNo,
                        message: `Oda ${guest.roomNo}: ${guest.firstName} ${guest.lastName} isimli misafirin ${missingFields.join(" ve ")} eksik!`,
                        severity: 'danger'
                    });
                }
            });

            if (missingDataErrors.length > 0) {
                setGeneralOperaErrorsData(prev => [
                    ...prev.filter(e => e.type !== 'MISSING_POLICE_DATA'),
                    ...missingDataErrors
                ]);

                const msg = `🚫 Polis raporunda ${missingDataErrors.length} misafirin kritik verisi eksik!`;
                if (!sentMessagesRef.current[msg]) {
                    addGeneralInfo('danger', msg, 'system');
                    sentMessagesRef.current[msg] = true;
                }
            }
            newChecksStatus['tcPassport'] = 'completed'; // Bu check ID'sini Context'teki checks arrayine göre ayarlayabilirsin
        }

        // DURUM GÜNCELLEME (UI İÇİN)
        Object.keys(newChecksStatus).forEach(id => {
            const current = checks.find(c => c.id === id)?.status;
            if (current !== newChecksStatus[id]) updateCheckStatus(id, newChecksStatus[id]);
        });

    }, [
        processedKBSData,
        processedInhouseData,
        processedRoutingData,
        processedPolisRaporuData,
        setKbsErrorsData,
        setGeneralOperaErrorsData,
        addGeneralInfo,
        updateCheckStatus,
        checks]);
};