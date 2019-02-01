import QRCodeSVG from './QRCodeSVG';

const qrcode = new QRCodeSVG('https://www.facebook.com/cheprasov.alexander');
qrcode.padding = 0;
console.log('html', btoa(qrcode.toHTML()).length);
console.log('dataUrl', qrcode.toDataUrl().length);
document.writeln(qrcode.toHTML());
document.writeln(`<img src="${qrcode.toDataUrl()}" />`);
//document.writeln(qrcode.toDataUrl());
