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

export const processMainTable = (inhouseData, routingData) => {
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

    return inhouseData.map(inhouseGuest => {
        const roomNo = inhouseGuest.roomNo;
        const routingListForRoom = routingMap.get(roomNo) || [];

        // --- KİŞİ SAYISI (PAX) ---
        const adult = parseInt(inhouseGuest.adults || 0);
        const child = parseInt(inhouseGuest.children || 0);
        const paxValue = child > 0 ? `${adult}/${child}` : `${adult}`;

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

        // --- ROUTING AYRIŞTIRMA (TO) ---
        const toRoutes = routingListForRoom
            .filter(route => getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to"))
            .map(route => {
                let rawText = getValueOrEmptyString(route.TRX_STRING).replace(/^Routed to\s+/i, "").trim();
                let parts = rawText.split(':');
                let infoPart = parts[0]?.trim() || "";
                let boardType = parts[1]?.trim() || "";
                let roomMatch = infoPart.match(/^(\d{3,4})\s+(.*)/);
                let isolatedRoom = roomMatch ? roomMatch[1] : "";
                let isolatedName = roomMatch ? roomMatch[2] : infoPart;
                let paymentMethod = (route.RI_ROUTING_TYPE === "W") ? getValueOrEmptyString(route.RI_PAYMENT_METHOD).trim() : "";
                return `${isolatedRoom}|${isolatedName}|${boardType}|${paymentMethod}`;
            });

        // --- ROUTING AYRIŞTIRMA (FROM) ---
        const fromRoutes = routingListForRoom
            .filter(route => getValueOrEmptyString(route.TRX_STRING).startsWith("Routed from"))
            .map(route => getValueOrEmptyString(route.TRX_STRING).replace(/^Routed from\s+/i, "").trim());

        let processedCompany = getValueOrEmptyString(inhouseGuest.companyName);
        if (processedCompany.length > 3) { processedCompany = processedCompany.substring(3); }

        return {
            id: uuidv4(),
            roomNo: getValueOrEmptyString(inhouseGuest.roomNo),
            name: formatName(getValueOrEmptyString(inhouseGuest.name)),
            pax: paxValue,
            rateCode: getValueOrEmptyString(inhouseGuest.rateCode),
            company: processedCompany,
            routing: [...new Set(toRoutes)].join('||'),
            routedFrom: [...new Set(fromRoutes)].join(', '),
            rate: getValueOrEmptyString(inhouseGuest.rate),
            caCl: getValueOrEmptyString(inhouseGuest.paymentMethod),
            paraBirimi: getValueOrEmptyString(inhouseGuest.currencyCode),
            comment: commentValue,
            cinDate: getValueOrEmptyString(inhouseGuest.arrivalDate),
            coutDate: getValueOrEmptyString(inhouseGuest.departureDate),
            balance: getValueOrEmptyString(inhouseGuest.balance),
        };
    });
};