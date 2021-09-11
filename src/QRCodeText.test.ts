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
import { ErrorCorrectionLevelEnum } from "./ErrorCorrectionLevelEnum";

describe('QRCodeText', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeText('');
            expect(qrCode.getBlackSymbol()).toEqual('▓▓');
            expect(qrCode.getWhiteSymbol()).toEqual('  ');
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeText(
                'test 84',
                {
                    level: ErrorCorrectionLevelEnum.HIGH,
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                    blackSymbol: '1',
                    whiteSymbol: '0',
                },
            );
            expect(qrCode.getBlackSymbol()).toEqual('1');
            expect(qrCode.getWhiteSymbol()).toEqual('0');
        });
    });

    describe('_clearCache', () => {
        class TestClass extends QRCodeText {

            callClearCache() {
                this._clearCache();
            }

            getQrCodeData() {
                return this._qrCodeData;
            }

            getQrCodeText() {
                return this._qrCodeText;
            }

        }
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new TestClass('test');
            expect(qrCode.getData()).not.toBeNull();
            qrCode.callClearCache();
            expect(qrCode.getQrCodeData()).toBeNull();
            expect(qrCode.getQrCodeText()).toBeNull();
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
