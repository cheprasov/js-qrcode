// @flow
/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeText from './QRCodeText';

describe('QRCodeText', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeText();
            expect(qrCode._value).toBeUndefined();
            expect(qrCode._padding).toEqual(1);
            expect(qrCode._level).toEqual('L');
            expect(qrCode._typeNumber).toEqual(0);
            expect(qrCode._areErrorsEnabled).toBeFalsy();
            expect(qrCode._isInvert).toBeFalsy();
            expect(qrCode.blackSymbol).toEqual('▓▓');
            expect(qrCode.whiteSymbol).toEqual('  ');
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeText('test 42', { level: 'Q' });
            expect(qrCode._value).toEqual('test 42');
            expect(qrCode._padding).toEqual(1);
            expect(qrCode._level).toEqual('Q');
            expect(qrCode._typeNumber).toEqual(0);
            expect(qrCode._areErrorsEnabled).toBeFalsy();
            expect(qrCode._isInvert).toBeFalsy();
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
            expect(qrCode._value).toEqual('test 84');
            expect(qrCode._padding).toEqual(0);
            expect(qrCode._level).toEqual('H');
            expect(qrCode._typeNumber).toEqual(20);
            expect(qrCode._areErrorsEnabled).toBeTruthy();
            expect(qrCode._isInvert).toBeTruthy();
            expect(qrCode.blackSymbol).toEqual('1');
            expect(qrCode.whiteSymbol).toEqual('0');
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new QRCodeText('test');
            qrCode._qrCodeData = [1, 2, 3, 4];
            qrCode.qrCodeText = '1-2-3-4';
            qrCode._clearCache();
            expect(qrCode._qrCodeData).toBeNull();
            expect(qrCode.qrCodeText).toBeNull();
        });
    });

    describe('toString', () => {
        it('should return null if qrCodeData is empty', () => {
            const qrCode = new QRCodeText('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode.toString()).toBeNull();
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
            expect(qrCode.toString()).toEqual('▓▓▓▓▓▓▓▓▓▓\n▓▓      ▓▓\n▓▓  ▓▓  ▓▓\n▓▓      ▓▓\n▓▓▓▓▓▓▓▓▓▓\n');
        });
    });

});
