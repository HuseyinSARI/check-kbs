import { v4 as uuidv4 } from 'uuid';

const getValueOrEmptyString = (value) => {
    return (value === null || value === undefined) ? '' : value;
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
                // routingList.G_ROUTING'in dizi veya nesne olduğunu kontrol et
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

        // Win1 ve Win2 için routing isimlerini bulma
        const win1Routing = routingListForRoom.find(route => 
            route.RI_FOLIO_VIEW === 1 && getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to")
        );
        const win2Routing = routingListForRoom.find(route => 
            route.RI_FOLIO_VIEW === 2 && getValueOrEmptyString(route.TRX_STRING).startsWith("Routed to")
        );

        let win1RoutingName = '';
        if (win1Routing) {
            win1RoutingName = getValueOrEmptyString(win1Routing.TRX_STRING).replace("Routed to ", "").trim().replace(":", "");
        }

        let win2RoutingName = '';
        if (win2Routing) {
            win2RoutingName = getValueOrEmptyString(win2Routing.TRX_STRING).replace("Routed to ", "").trim().replace(":", "");
        }
        
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
        
        // Routing sütunu için mevcut mantık
        let routingValue = "";
        const relevantRoutes = routingListForRoom
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
            
            // win1 ve win2 verilerini özel bir obje olarak döndürüyoruz
            win1: {
                cashringValue: getValueOrEmptyString(cashringInfo.win1),
                routingName: win1RoutingName,
            },
            win2: {
                cashringValue: getValueOrEmptyString(cashringInfo.win2),
                routingName: win2RoutingName,
            },
            odaDegeri: getValueOrEmptyString(cashringInfo.accRate),
        };
    });

    return mainTable;
};