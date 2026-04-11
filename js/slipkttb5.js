// ==========================================
// 1. โหลดเฉพาะฟอนต์ที่ใช้สำหรับ TTB
// ==========================================
function loadFonts() {
    const fonts = [
        new FontFace('DXTTBBold', 'url(assets/fonts/DX-TTB-bold.woff)'),
        new FontFace('DXTTBRegular', 'url(assets/fonts/DX-TTB-regular.woff)'),
        new FontFace('TTBMoneyRegular', 'url(assets/fonts/TTB-Money-Regular.woff)'),
        new FontFace('TTBMoneyMedium', 'url(assets/fonts/TTB-Money-Medium.woff)'),
        new FontFace('TTBMoneySemiBold', 'url(assets/fonts/TTB-Money-SemiBold.woff)'),
        new FontFace('TTBMoneyBold', 'url(assets/fonts/TTB-Money-Bold.woff)'),
        new FontFace('TTBMoneyExtraBold', 'url(assets/fonts/TTB-Money-ExtraBold.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if (font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    
    const bankSelect = document.getElementById('bank');
    if(bankSelect) {
        bankSelect.addEventListener('change', window.autoFormatAccount);
    }

    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay();
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtElem = document.getElementById('datetime');
    if (dtElem && !dtElem.value) dtElem.value = formattedDateTime;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function formatDate(date) {
    if (!date || date === '-') return '-';
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    let formattedDate = new Date(date).toLocaleDateString('th-TH', options);
    formattedDate = formattedDate.replace(/ /g, ' ').replace(/\./g, '');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const parts = formattedDate.split(' ');
    if (parts.length < 3) return formattedDate;
    const day = padZero(parts[0]);
    const month = months[new Date(date).getMonth()];
    let year = parts[2];
    year = `25${year}`;
    return `${day} ${month} ${year}`;
}

function generateUniqueID() {
    const now = new Date(document.getElementById('datetime')?.value || new Date());
    const year = now.getFullYear().toString().slice(-4);
    const month = padZero(now.getMonth() + 1);
    const day = padZero(now.getDate());
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const randomNumber = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${year}${month}${day}${hours}${randomNumber}`;
}

function loadImage(src) {
    return new Promise((resolve) => {
        if (!src) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// ระบบเปลี่ยนรูปแบบเลขบัญชีอัตโนมัติ
window.autoFormatAccount = function() {
    const bank = document.getElementById('bank')?.value;
    const accInput = document.getElementById('receiveraccount');
    if(!bank || !accInput) return;
    
    if (bank === 'GSB' || bank === 'BAAC') { 
        accInput.value = 'XXX-X-XXXX0-000';
    } else if (bank.includes('พร้อมเพย์') && !bank.includes('e-Wallet')) {
        accInput.value = 'XXX XXX 0000';
    } else if (bank === 'พร้อมเพย์ e-Wallet') {
        accInput.value = 'XXX-XXXXXXXX-0000';
    } else if (bank === 'ChillPay') {
        accInput.value = '010553509091216';
    } else {
        accInput.value = 'XXX-X-XX000-0';
    }
}

window.updateDisplay = async function() {
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const Itemcode = document.getElementById('Itemcode')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '-';
    const amountDecimal = document.getElementById('amountDecimal')?.value || '-';
    const datetime = document.getElementById('datetime')?.value || '-';
    const AideMemoire = document.getElementById('AideMemoire')?.value || '-';
    const QRCode = document.getElementById('QRCode')?.value || '';
    
    const selectedImage = document.getElementById('imageSelect')?.value || '';
    let backgroundSelect = document.getElementById('backgroundSelect')?.value || '';

    const noteToggleElem = document.getElementById('modeSwitch') || document.getElementById('noteToggle');
    const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;

    let bankLogoUrl = '';
    // 🟢 แก้ชื่อไฟล์กลับเป็น TTB2.png ให้ตรงกับโฟลเดอร์ของพี่
    switch (bank) {
        case 'KBANK': bankLogoUrl = 'assets/image/logo/KBANK1.3.png'; break;
        case 'KTB': bankLogoUrl = 'assets/image/logo/KTB2.png'; break;
        case 'BBL': bankLogoUrl = 'assets/image/logo/BBL4.png'; break;
        case 'SCB': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
        case 'BAY': bankLogoUrl = 'assets/image/logo/BAY2.1.png'; break;
        case 'ttb': bankLogoUrl = 'assets/image/logo/TTB2.png'; break; 
        case 'GSB': bankLogoUrl = 'assets/image/logo/O2.png'; break;
        case 'BAAC': bankLogoUrl = 'assets/image/logo/T2.png'; break;
        case 'GHB': bankLogoUrl = 'assets/image/logo/C1.png'; break;
        case 'KKP': bankLogoUrl = 'assets/image/logo/K1.png'; break;
        case 'CIMB': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
        case 'UOB': bankLogoUrl = 'assets/image/logo/UOB4.png'; break;
        case 'LH BANK': bankLogoUrl = 'assets/image/logo/LHBANK1.png'; break;
        case 'ICBC': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
        case 'พร้อมเพย์': bankLogoUrl = 'assets/image/logo/P-TTB1.png'; break;
        case 'พร้อมเพย์ e-Wallet': bankLogoUrl = 'assets/image/logo/P-TTB1.png'; break;
        case 'ChillPay': bankLogoUrl = 'assets/image/logo/CP-TTB.png'; break;
        default: bankLogoUrl = '';
    }

    const formattedDate = formatDate(datetime);
    let formattedTime = '';
    if (datetime && datetime !== '-') {
        const d = new Date(datetime);
        if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ==========================================
    // จัดการพื้นหลัง (สลับโหมด TTB)
    // ==========================================
    let backgroundImageSrc = backgroundSelect;

    if (isNoteMode) {
        const bgNoteElem = document.getElementById('bg_note');
        if (bgNoteElem && bgNoteElem.value) {
            backgroundImageSrc = bgNoteElem.value;
        } else if (!backgroundImageSrc.includes('T.jpg')) {
            backgroundImageSrc = backgroundImageSrc.replace('.jpg', 'T.jpg');
        }
        
        if (bank === 'พร้อมเพย์ e-Wallet') {
            canvas.width = 714; canvas.height = 1320;
            backgroundImageSrc = backgroundImageSrc.replace('/T', '/TT');
        } else if (bank === 'ChillPay') {
            canvas.width = 714; canvas.height = 1320;
            backgroundImageSrc = backgroundImageSrc.replace('/T', '/CT');
        } else {
            canvas.width = 714; canvas.height = 1280;
        }
        
    } else {
        if (backgroundImageSrc.includes('T.jpg')) {
            backgroundImageSrc = backgroundImageSrc.replace('T.jpg', '.jpg');
        }
        
        if (bank === 'พร้อมเพย์ e-Wallet') {
            canvas.width = 752; canvas.height = 1320;
            backgroundImageSrc = backgroundImageSrc.replace('/T', '/TT');
        } else if (bank === 'ChillPay') {
            canvas.width = 752; canvas.height = 1320;
            backgroundImageSrc = backgroundImageSrc.replace('/T', '/CT');
        } else {
            canvas.width = 752; canvas.height = 1280;
        }
    }

    let originalBgSrc = backgroundImageSrc;
    let bgImg = await loadImage(backgroundImageSrc);
    if (!bgImg) bgImg = await loadImage(originalBgSrc);

    // 🟢 เพิ่มคำสั่งโหลด "โลโก้ผู้โอน (TTB2.png)" เข้ามาด้วย
    const [bankLogoImg, senderLogoImg, customStickerImg] = await Promise.all([
        loadImage(bankLogoUrl),
        loadImage('assets/image/logo/TTB2.png'), // โลโก้ด้านบนของผู้โอน
        loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
    ]);

    if (bgImg) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff4d4f'; ctx.font = '30px DXTTBBold';
        ctx.fillText('❌ หาไฟล์พื้นหลังไม่เจอ!', 50, canvas.height / 2);
    }

    // ==========================================
    // วาดรายละเอียดลงสลิป TTB
    // ==========================================
    const modifiedReceiverName = receivername.replace(/\s+/g, '');
    const amountText = `${amount11}`;
    const amountUnit = `${amountDecimal}`;
    const totalText = amountText + ' ' + amountUnit;

    if (isNoteMode) {
        // 🟢 โหมดมีบันทึกช่วยจำ (Canvas width 714)
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 49.5, 740.7, 80.0, 80.0);
        // 🟢 วาดโลโก้ผู้โอน (TTB) 
        if(senderLogoImg) ctx.drawImage(senderLogoImg, 49.5, 565.1, 80.0, 80.0);
        
        drawText(ctx, `${formattedDate}, ${formattedTime} น.`, 356, 400.8, 21.33, 'DXTTBRegular', '#9099a2', 'center', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 138.5, 598.5, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 138.5, 637.8, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
        drawText(ctx, `ttb`, 138.5, 678.1, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);

        if (bank === 'พร้อมเพย์ e-Wallet') {
            drawText(ctx, `พร้อมเพย์ e-Wallet`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `(EW01)`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receivername}`, 138.5, 889.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);
            
            drawText(ctx, `${generateUniqueID()}`, 166.9, 1032.7, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${AideMemoire}`, 655, 970.9, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);

        } else if (bank === 'ChillPay') {
            drawText(ctx, `ChillPay-${receivername}`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${Itemcode}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${modifiedReceiverName}`, 138.5, 889.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${generateUniqueID()}`, 166.9, 1032.7, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${AideMemoire}`, 655, 970.9, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);

        } else {
            drawText(ctx, `${receivername}`, 138.5, 772.7, 24.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, 138.5, 811.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            const bankTextLabel = document.getElementById('bank').options[document.getElementById('bank').selectedIndex].text;
            drawText(ctx, `${bankTextLabel}`, 138.5, 850.9, 24.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);
            
            drawText(ctx, `${generateUniqueID()}`, 166.9, 993.0, 21.33, 'DXTTBRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
            drawText(ctx, `${AideMemoire}`, 655, 931.2, 24.3, 'DXTTBBold', '#0a2e6c', 'right', 1.5, 3, 0, 0, 800, 0);
        }

        const centerX = canvas.width / 1.90;
        const amountY = 483.5;
        
        const amountX = centerX - (ctx.measureText(totalText).width / 0.83);
        drawText(ctx, amountText, amountX, amountY, 58.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
        const amountWidth = ctx.measureText(amountText).width;
        drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 42.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);

        drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'DXTTBRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);

    } else {
        // 🔵 โหมดปกติ ไม่บันทึก (Canvas width 752)
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 51.5, 777.5, 86.0, 86.0); 
        // 🟢 วาดโลโก้ผู้โอน (TTB) 
        if(senderLogoImg) ctx.drawImage(senderLogoImg, 51.5, 595.0, 86.0, 86.0);
        
        drawText(ctx, `${formattedDate}, ${formattedTime} น.`, 376, 421.8, 22.33, 'DXTTBRegular', '#9099a2', 'center', 1.5, 3, 0, 0, 800, 0);

        drawText(ctx, `${sendername}`, 145.5, 629.8, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
        drawText(ctx, `${senderaccount}`, 145.5, 670.9, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
        drawText(ctx, `ttb`, 145.5, 713.8, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);

        if (bank === 'พร้อมเพย์ e-Wallet') {
            drawText(ctx, `พร้อมเพย์ e-Wallet`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `(EW01)`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${receivername}`, 145.5, 940.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${generateUniqueID()}`, 173.1, 1017.5, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
            
            const centerX = canvas.width / 1.97;
            const amountY = 507.8; 
            const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
            drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
            const amountWidth = ctx.measureText(amountText).width;
            drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);

        } else if (bank === 'ChillPay') {
            drawText(ctx, `ChillPay-${receivername}`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 2, 0, 0, 500, 0);
            drawText(ctx, `${receiveraccount}`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#0a2e6c', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${Itemcode}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            drawText(ctx, `${modifiedReceiverName}`, 145.5, 940.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 3, 0, 0, 800, 0);

            drawText(ctx, `${generateUniqueID()}`, 173.1, 1017.5, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);
            
            const centerX = canvas.width / 1.97;
            const amountY = 507.8; 
            const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
            drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
            const amountWidth = ctx.measureText(amountText).width;
            drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);

        } else {
            drawText(ctx, `${receivername}`, 145.5, 813.4, 25.3, 'DXTTBBold', '#0a2e6c', 'left', 1.5, 3, 0, 0, 800, 0);
            drawText(ctx, `${receiveraccount}`, 145.5, 855.0, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 1, 0, 0, 500, 0);
            const bankTextLabel = document.getElementById('bank').options[document.getElementById('bank').selectedIndex].text;
            drawText(ctx, `${bankTextLabel}`, 145.5, 897.5, 25.3, 'DXTTBRegular', '#7d8085', 'left', 1.5, 2, 0, 0, 500, 0);
            
            drawText(ctx, `${generateUniqueID()}`, 173.1, 978.2, 22.33, 'TTBMoneyRegular', '#8e959d', 'left', 1.5, 3, 0, 0, 500, 0);

            const centerX = canvas.width / 1.97;
            const amountY = 507.8;
            const amountX = centerX - (ctx.measureText(totalText).width / 0.82);
            drawText(ctx, amountText, amountX, amountY, 59.0, 'DXTTBBold', '#00225c', 'left', 1.5, 3, 0, 0, 500, 0);
            const amountWidth = ctx.measureText(amountText).width;
            drawText(ctx, amountUnit, amountX + amountWidth - 1, amountY, 43.50, 'DXTTBBold', '#00225c', 'left', 1.5, 0, 0, 0, 500, 0);
        }

        drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'TTBMoneyRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 500, 0);
    }

    if (customStickerImg) {
        ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height);
    }
};

// ==========================================
// ฟังก์ชันช่วยวาดข้อความ (Text)
// ==========================================
function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const isThai = /[\u0E00-\u0E7F]/.test(char);
            const isWhitespace = /\s/.test(char);

            if (isThai && !isWhitespace) {
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                if (testWidth > maxWidth) {
                    lines.push(currentLine.trim());
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            } else {
                const testLine = currentLine + char;
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

                if (testWidth > maxWidth) {
                    lines.push(currentLine.trim());
                    currentLine = char;
                } else {
                    currentLine = testLine;
                }
            }
        }

        lines.push(currentLine.trim());

        lines.forEach((line, index) => {
            let currentX = x;
            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }

            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) return;
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char, index) => {
        const charCode = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1] : null;

        const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
        const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
        const isBeforeVowel = (charCode === 0x0E31);
        const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

        let yOffset = 0;
        let xOffset = 0;

        if (isUpperVowel) { yOffset = -1; xOffset = 0; }
        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8; xOffset = 0;
            } else {
                yOffset = 0; xOffset = -7;
            }
        }
        if (isBeforeVowel) { yOffset = -1; xOffset = 1; }
        if (isBelowVowel) { yOffset = 0; xOffset = -10; }

        ctx.fillText(char, currentPosition + xOffset, y + yOffset);

        if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
            currentPosition += ctx.measureText(char).width + letterSpacing;
        } else {
            currentPosition += ctx.measureText(char).width;
        }
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'ttb_slip.png';
    link.click();
}