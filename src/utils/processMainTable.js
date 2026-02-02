import { v4 as uuidv4 } from 'uuid';

const getValueOrEmptyString = (value) => {
    return (value === null || value === undefined) ? '' : value;
};

// --- İSİM TEMİZLEME VE FORMATLAMA FONKSİYONU ---
const formatName = (rawName) => {
    if (!rawName) return "";
    let clean = rawName.replace(/,?\s?(BYN|BY|BAYAN|BAY)$/gi, '');
    let parts = clean.split(',').map(p => p.trim());
    if (parts.length >= 2) {
        return `${parts[1]} ${parts[0]}`; 
    }
    return parts[0];
};

export const processMainTable = (inhouseData, routingData, cashringData) => {
    if (!inhouseData || inhouseData.length === 0) {
        return [];
    }

    const routingMap = new Map();
    if (Array.isArray(routingData)) {
        routingData.forEach(route => {
            const roomNo = route.roomNo;
            if (roomNo) {
                const rawRouting = route.routingList?.G_ROUTING;
                const routingItems = Array.isArray(rawRouting) ? rawRouting : (rawRouting ? [rawRouting] : []);
                if (!routingMap.has(roomNo)) {
                    routingMap.set(roomNo, []);
                }
                routingMap.get(roomNo).push(...routingItems);
            }
        });
    }

    const cashringMap = new Map();
    if (Array.isArray(cashringData)) {
        cashringData.forEach(item => {
            if (item.roomNo) {
                cashringMap.set(item.roomNo, item);
            }
        });
    }

    const mainTable = inhouseData.map(inhouseGuest => {
        const roomNo = inhouseGuest.roomNo;
        const routingListForRoom = routingMap.get(roomNo) || [];
        const cashringInfo = cashringMap.get(roomNo) || {};

        // --- COMMENT BİRLEŞTİRME ---
        let commentValue = "";
        const rawCommentData = inhouseGuest.LIST_G_COMMENT_RESV_NAME_ID || inhouseGuest.comment;
        if (rawCommentData && rawCommentData.G_COMMENT_RESV_NAME_ID) {
            const commentsArray = Array.isArray(rawCommentData.G_COMMENT_RESV_NAME_ID) 
                ? rawCommentData.G_COMMENT_RESV_NAME_ID 
                : [rawCommentData.G_COMMENT_RESV_NAME_ID];
            commentValue = commentsArray
                .map(item => getValueOrEmptyString(item.RES_COMMENT).trim())
                .filter(text => text !== "")
                .join(" || ");
        } else if (rawCommentData && rawCommentData.RES_COMMENT) {
            commentValue = getValueOrEmptyString(rawCommentData.RES_COMMENT);
        }

        // --- ROUTING AYRIŞTIRMA (TO & FROM) ---
        const toRoutes = routingListForRoom
            .filter(route => getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to"))
            .map(route => {
                let rawText = getValueOrEmptyString(route.TRX_STRING).replace(/^Routed to\s+/i, "").trim();
                
                // Parçalama: "403 Pegasus: BB" -> ["403 Pegasus", "BB"]
                let parts = rawText.split(':');
                let mainInfo = parts[0] ? parts[0].trim() : "";
                let boardType = parts[1] ? parts[1].trim() : "";
                
                // Eğer WIN tipi ise ödeme metodunu al (BNK, CL, CA vb.)
                let paymentMethod = (route.RI_ROUTING_TYPE === "W") ? getValueOrEmptyString(route.RI_PAYMENT_METHOD) : "";

                // UI'da parçalamak için özel ayraç kullanıyoruz
                return `${mainInfo}|${boardType}|${paymentMethod}`;
            });

        const fromRoutes = routingListForRoom
            .filter(route => getValueOrEmptyString(route.TRX_STRING).startsWith("Routed from"))
            .map(route => {
                return getValueOrEmptyString(route.TRX_STRING).replace(/^Routed from\s+/i, "").trim();
            });

        // Unique yap ve çift boru ile birleştir
        let routingValue = toRoutes.length > 0 ? [...new Set(toRoutes)].join('||') : "";
        let routedFromValue = fromRoutes.length > 0 ? [...new Set(fromRoutes)].join(', ') : "";

        // --- WIN1 & WIN2 ---
        const win1Routing = routingListForRoom.find(route => route.RI_FOLIO_VIEW === 1 && getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to"));
        const win2Routing = routingListForRoom.find(route => route.RI_FOLIO_VIEW === 2 && getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to"));
        let win1RoutingName = win1Routing ? getValueOrEmptyString(win1Routing.TRX_STRING).replace(/^Routed to\s+/i, "").trim() : '';
        let win2RoutingName = win2Routing ? getValueOrEmptyString(win2Routing.TRX_STRING).replace(/^Routed to\s+/i, "").trim() : '';
        
        let processedCompany = getValueOrEmptyString(inhouseGuest.companyName);
        if (processedCompany.length > 3) { processedCompany = processedCompany.substring(3); }

        return {
            id: uuidv4(),
            roomNo: getValueOrEmptyString(inhouseGuest.roomNo),
            name: formatName(getValueOrEmptyString(inhouseGuest.name)),
            rateCode: getValueOrEmptyString(inhouseGuest.rateCode),
            company: processedCompany,
            routing: routingValue,
            routedFrom: routedFromValue,
            rate: getValueOrEmptyString(inhouseGuest.rate),
            caCl: getValueOrEmptyString(inhouseGuest.paymentMethod),
            paraBirimi: getValueOrEmptyString(inhouseGuest.currencyCode),
            comment: commentValue,
            cinDate: getValueOrEmptyString(inhouseGuest.arrivalDate),
            coutDate: getValueOrEmptyString(inhouseGuest.departureDate),
            balance: getValueOrEmptyString(inhouseGuest.balance),
            win1: { cashringValue: getValueOrEmptyString(cashringInfo.win1), routingName: win1RoutingName },
            win2: { cashringValue: getValueOrEmptyString(cashringInfo.win2), routingName: win2RoutingName },
            odaDegeri: getValueOrEmptyString(cashringInfo.accRate),
        };
    });

    return mainTable;
};