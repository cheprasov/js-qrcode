// @flow

// export { default as QRCodeCanvas } from './QRCodeCanvas';
// export { default as QRCodeRaw } from './QRCodeRaw';
// export { default as QRCodeSVG } from './QRCodeSVG';
// export { default as QRCodeText } from './QRCodeText';

import QRCodeRaw from './QRCodeRaw';

const config = {
    level: 'H', // use high error correction level
    padding: 0, // do not use padding around qr code data
};

const qrRaw = new QRCodeRaw('some value', config);
const qrCodeRaw = qrRaw.getData();
if (qrCodeRaw) {
    console.log(qrCodeRaw);
    //
}
