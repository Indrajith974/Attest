import QRCode from 'qrcode';

/**
 * Generate QR code as data URL for a proof page
 */
export async function generateQRCode(url) {
    try {
        const dataUrl = await QRCode.toDataURL(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff'
            }
        });
        return dataUrl;
    } catch (error) {
        console.error('QR code generation error:', error);
        throw error;
    }
}

/**
 * Generate QR code as PNG buffer
 */
export async function generateQRCodeBuffer(url) {
    try {
        const buffer = await QRCode.toBuffer(url, {
            width: 256,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff'
            }
        });
        return buffer;
    } catch (error) {
        console.error('QR code generation error:', error);
        throw error;
    }
}

export default { generateQRCode, generateQRCodeBuffer };
