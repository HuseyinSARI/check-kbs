// src/utils/checkRoutingComments.js

/**
 * Routing yapılan odaların yorum (comment) kısımlarındaki misafir isimlerinin doğruluğunu kontrol eder.
 * @param {Array<Object>} inhouseData - İşlenmiş Inhouse verisi (misafir ve oda bilgileri).
 * @param {Array<Object>} routingData - İşlenmiş Routing verisi (hangi odaların hangi odaya yönlendirildiği).
 * @returns {Array<Object>} - Bulunan hataları içeren bir dizi.
 */
export const checkRoutingComments = (inhouseData, routingData) => {
    const errors = [];

    // 1. Routing yapılan odaları ve ana odayı tespit etme
    routingData.forEach(routingEntry => {
        const sourceRoom = routingEntry.SourceRoom;
        const targetRoom = routingEntry.TargetRoom;
        
        // Eğer routing işlemi ana odaya (kendi kendine) yapılmışsa atla.
        if (sourceRoom === targetRoom) {
            return;
        }

        // 2. Yönlendirilen odalardaki misafirlerin isimlerini alma
        const routedGuestNames = inhouseData
            .filter(room => room.roomNo === sourceRoom)
            .map(room => `${room.firstName} ${room.lastName}`);

        // Routing yapılan odada misafir yoksa devam et
        if (routedGuestNames.length === 0) {
            return;
        }
        
        // 3. Ana odanın yorum (comment) kısmını inceleme
        const targetRoomData = inhouseData.find(room => room.roomNo === targetRoom);

        // Ana oda bulunamazsa veya yorumu yoksa hata ver.
        if (!targetRoomData) {
            errors.push({
                roomNo: targetRoom,
                message: `Ana oda (${targetRoom}) Inhouse verisinde bulunamadı.`
            });
            return;
        }

        const comment = targetRoomData.comment || '';
        
        // Yorum 2 ile başlamıyorsa hata ver.
        if (!comment.startsWith('2')) {
            errors.push({
                roomNo: targetRoom,
                message: `Yönlendirme yapılan ana odanın (${targetRoom}) yorumu '2' ile başlamıyor.`
            });
            return;
        }

        // Yorumdan isimleri ayıklama (Burada daha karmaşık regex kullanılabilir ancak basit bir ayrıştırma yapalım)
        const commentNames = comment.substring(1).trim().split(/, | ve /).filter(name => name.length > 0);

        // 4. Karşılaştırma
        const missingNamesInComment = routedGuestNames.filter(name => 
            !commentNames.some(commentName => 
                commentName.toLowerCase() === name.toLowerCase()
            )
        );

        if (missingNamesInComment.length > 0) {
            errors.push({
                roomNo: targetRoom,
                message: `Ana oda (${targetRoom}) yorumunda eksik veya hatalı isimler var. Eksik isimler: ${missingNamesInComment.join(', ')}`,
                details: {
                    expected: routedGuestNames,
                    found: commentNames
                }
            });
        }
    });

    return errors;
};