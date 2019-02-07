// @flow

import QRCodeText from './QRCodeText';

describe('QRCodeText', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeText();
            expect(qrCode.value).toBeUndefined();
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('L');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.blackSymbol).toEqual('▓▓');
            expect(qrCode.whiteSymbol).toEqual('  ');
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeText('test 42', { level: 'Q' });
            expect(qrCode.value).toEqual('test 42');
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('Q');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.blackSymbol).toEqual('▓▓');
            expect(qrCode.whiteSymbol).toEqual('  ');
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeText(
                'test 84',
                {
                    level: 'H',
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                    blackSymbol: '1',
                    whiteSymbol: '0',
                },
            );
            expect(qrCode.value).toEqual('test 84');
            expect(qrCode.padding).toEqual(0);
            expect(qrCode.level).toEqual('H');
            expect(qrCode.typeNumber).toEqual(20);
            expect(qrCode.errorsEnabled).toBeTruthy();
            expect(qrCode.invert).toBeTruthy();
            expect(qrCode.blackSymbol).toEqual('1');
            expect(qrCode.whiteSymbol).toEqual('0');
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new QRCodeText('test');
            qrCode.qrCodeData = [1, 2, 3, 4];
            qrCode.qrCodeText = '1-2-3-4';
            qrCode._clearCache();
            expect(qrCode.qrCodeData).toBeNull();
            expect(qrCode.qrCodeText).toBeNull();
        });
    });

    describe('toText', () => {
        it('should return null if qrCodeData is empty', () => {
            const qrCode = new QRCodeText('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode.toText()).toBeNull();
        });

        it('should return text QR code', () => {
            const qrCode = new QRCodeText('test');
            qrCode.getData = jest.fn(() => [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, true, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ]);
            expect(qrCode.toText()).toEqual('▓▓▓▓▓▓▓▓▓▓\n▓▓      ▓▓\n▓▓  ▓▓  ▓▓\n▓▓      ▓▓\n▓▓▓▓▓▓▓▓▓▓\n');
        });
    });

});
