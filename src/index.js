// @flow

// export { default as QRCodeCanvas } from './QRCodeCanvas';
// export { default as QRCodeRaw } from './QRCodeRaw';
// export { default as QRCodeSVG } from './QRCodeSVG';
// export { default as QRCodeText } from './QRCodeText';

import QRCodeSVG from './QRCodeSVG';

const qrcode = new QRCodeSVG('3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914');

document.writeln('<img src="' + qrcode.toDataUrl() + '" />');
