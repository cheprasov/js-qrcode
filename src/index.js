import QRCodeSVG from './QRCodeSVG';

const qrcode = new QRCodeSVG('Hello how are you today? Hello how are you today? Hello how are you today?');
qrcode.padding = 1;
document.writeln(qrcode.getAsHTML());
