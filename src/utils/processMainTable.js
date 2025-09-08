import { v4 as uuidv4 } from 'uuid';

const getValueOrEmptyString = (value) => {
    return (value === null || value === undefined) ? '' : value;
};

export const processMainTable = (inhouseData, routingData, cashringData) => {
    if (!inhouseData || inhouseData.length === 0) {
        return [];
    }

    // Routing verisini oda numarasına göre bir Map'e dönüştürme
    const routingMap = new Map();
    if (Array.isArray(routingData)) {
        routingData.forEach(route => {
            if (route.roomNo) {
                routingMap.set(route.roomNo, route);
            }
        });
    }

    // --- YENİ EKLENECEK KISIM ---
    // Cashring verisini oda numarasına göre bir Map'e dönüştürme
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
        
        // Map'ten verileri güvenli bir şekilde al
        const routingInfo = routingMap.get(roomNo) || {};
        const cashringInfo = cashringMap.get(roomNo) || {}; // Artık bu satır doğru çalışacak

        let commentValue = "";
        const rawComment = getValueOrEmptyString(inhouseGuest.comment);

        if (rawComment) {
            if (Array.isArray(rawComment.G_COMMENT_RESV_NAME_ID)) {
                const cashieringComment = rawComment.G_COMMENT_RESV_NAME_ID.find((item) => item.RES_COMMENT_TYPE === "CAS");
                const reservationComment = rawComment.G_COMMENT_RESV_NAME_ID.find((item) => item.RES_COMMENT_TYPE === "RES");

                if (cashieringComment) {
                    commentValue = getValueOrEmptyString(cashieringComment.RES_COMMENT);
                } else if (reservationComment) {
                    commentValue = getValueOrEmptyString(reservationComment.RES_COMMENT);
                }
            } else if (rawComment.G_COMMENT_RESV_NAME_ID) {
                if (rawComment.G_COMMENT_RESV_NAME_ID.RES_COMMENT) {
                    commentValue = getValueOrEmptyString(rawComment.G_COMMENT_RESV_NAME_ID.RES_COMMENT);
                } else {
                    commentValue = getValueOrEmptyString(rawComment.RES_COMMENT);
                }
            } else if (rawComment.RES_COMMENT) {
                commentValue = getValueOrEmptyString(rawComment.RES_COMMENT);
            }
        }

        let routingValue = "";
        const rawRouting = routingInfo.routingList?.G_ROUTING;

        if (rawRouting) {
            const routingItems = Array.isArray(rawRouting) ? rawRouting : [rawRouting];
            const relevantRoutes = routingItems
                .filter(route => getValueOrEmptyString(route.TRX_STRING) && getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to"))
                .map(route => {
                    const text = getValueOrEmptyString(route.TRX_STRING).replace("Routed to ", "").trim();
                    const cleanText = text.endsWith(':') ? text.slice(0, -1) : text;
                    const match = cleanText.match(/^(\d{3,4})\s/);
                    if (match) {
                        return match[1];
                    }
                    return cleanText;
                });
            
            if (relevantRoutes.length > 0) {
                routingValue = relevantRoutes.join(', ');
            }
        }

        let processedCompany = getValueOrEmptyString(inhouseGuest.companyName);
        if (processedCompany.length > 3) {
            processedCompany = processedCompany.substring(3);
        }

        return {
            id: uuidv4(),
            roomNo: getValueOrEmptyString(inhouseGuest.roomNo),
            name: getValueOrEmptyString(inhouseGuest.name),
            rateCode: getValueOrEmptyString(inhouseGuest.rateCode),
            company: processedCompany,
            routing: routingValue,
            rate: getValueOrEmptyString(inhouseGuest.rate),
            caCl: getValueOrEmptyString(inhouseGuest.paymentMethod),
            paraBirimi: getValueOrEmptyString(inhouseGuest.currencyCode),
            comment: commentValue,
            cinDate: getValueOrEmptyString(inhouseGuest.arrivalDate),
            coutDate: getValueOrEmptyString(inhouseGuest.departureDate),
            balance: getValueOrEmptyString(inhouseGuest.balance),
            // Map'ten gelen güvenli veriyi kullanıyoruz
            win1: getValueOrEmptyString(cashringInfo.win1),
            win2: getValueOrEmptyString(cashringInfo.win2),
            odaDegeri: getValueOrEmptyString(cashringInfo.accRate),
        };
    });

    return mainTable;
};