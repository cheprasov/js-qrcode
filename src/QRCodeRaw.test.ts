/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-ignore
import QRCodeCore from 'qr.js/lib/QRCode';
import QRCodeRaw, { QRCodeDataType } from './QRCodeRaw';
import { ErrorCorrectionLevelEnum } from "./ErrorCorrectionLevelEnum";

jest.mock('qr.js/lib/QRCode', () => {
    return class {

        modules: boolean[][] | null = null;

        make() {
            this.modules = [[true, true], [false, false]];
        }

        addData = (value: string) => {
            if (value === 'bad') {
                throw new Error('Some error');
            }
        }

    }
});

describe('QRCodeRaw', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeRaw('');
            expect(qrCode.getValue()).toEqual('');
            expect(qrCode.getPadding()).toEqual(1);
            expect(qrCode.getLevel()).toEqual(ErrorCorrectionLevelEnum.LOW);
            expect(qrCode.getTypeNumber()).toEqual(0);
            expect(qrCode.areErrorsEnabled()).toBeFalsy();
            expect(qrCode.isInvert()).toBeFalsy();
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeRaw('test 42', { level: ErrorCorrectionLevelEnum.QUARTILE });
            expect(qrCode.getValue()).toEqual('test 42');
            expect(qrCode.getPadding()).toEqual(1);
            expect(qrCode.getLevel()).toEqual('Q');
            expect(qrCode.getTypeNumber()).toEqual(0);
            expect(qrCode.areErrorsEnabled()).toBeFalsy();
            expect(qrCode.isInvert()).toBeFalsy();
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeRaw(
                'test 84',
                {
                    level: ErrorCorrectionLevelEnum.HIGH,
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                },
            );
            expect(qrCode.getValue()).toEqual('test 84');
            expect(qrCode.getPadding()).toEqual(0);
            expect(qrCode.getLevel()).toEqual(ErrorCorrectionLevelEnum.HIGH);
            expect(qrCode.getTypeNumber()).toEqual(20);
            expect(qrCode.areErrorsEnabled()).toBeTruthy();
            expect(qrCode.isInvert()).toBeTruthy();
        });
    });

    describe('setValue', () => {
        it('should set new value and clear cache', () => {
            class TestClass extends QRCodeRaw {

                protected _clearCache = jest.fn();

                setClearCache(f: jest.Mock) {
                    return this._clearCache = f;
                }

                getClearCache() {
                    return this._clearCache;
                }

            }
            const qrCode = new TestClass('test');
            const clearCache = jest.fn();
            qrCode.setClearCache(clearCache);

            qrCode.setValue('foo 42');
            expect(qrCode.getValue()).toEqual('foo 42');
            expect(qrCode.getClearCache()).toHaveBeenCalled();
        });
    });

    describe('getDataSize', () => {
        it('should return 0 if data is empty', () => {
            const qrCode = new QRCodeRaw('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode.getDataSize()).toEqual(0);
        });

        it('should return length of data', () => {
            const qrCode = new QRCodeRaw('test');
            qrCode.getData = jest.fn(() => [[true, true], [false, false], [true, true], [false, false]]);
            expect(qrCode.getDataSize()).toEqual(4);
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData', () => {
            class TestClass extends QRCodeRaw {

                callClearCache() {
                    this._clearCache();
                }

                getQrCodeData() {
                    return this._qrCodeData;
                }

            }

            const qrCode = new TestClass('test');
            qrCode.getData();
            const data = qrCode.getQrCodeData();
            expect(data).not.toBeNull();
            qrCode.callClearCache();
            expect(qrCode.getQrCodeData()).toBeNull();
        });
    });

    describe('_getQrCodeData', () => {
        class TestClass extends QRCodeRaw {

            getQrCodeData(modules: QRCodeDataType) {
                return this._getQrCodeData(modules);
            }

        }

        let qrCode: TestClass;

        beforeEach(() => {
            qrCode = new TestClass('test', { padding: 0 });
        });

        it('should return deep cloned arrays', () => {
            const source = [
                [true, true, true],
                [true, false, true],
                [true, true, true],
            ];
            const result = qrCode.getQrCodeData(source);
            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            source[1][1] = true;
            expect(result).not.toEqual(source);
        });

        it('should invert data if the param is enabled', () => {
            qrCode = new TestClass('test', { padding: 0, invert: true });
            const source = [
                [false, true, true],
                [true, false, true],
                [false, true, true],
            ];
            const result = qrCode.getQrCodeData(source);
            expect(result).toEqual([
                [true, false, false],
                [false, true, false],
                [true, false, false],
            ]);
        });

        it('should add padding to data', () => {
            const source = [
                [false, true, true],
                [true, false, true],
                [false, true, true],
            ];

            qrCode = new TestClass('test', { padding: 1 });
            expect(qrCode.getQrCodeData(source)).toEqual([
                [false, false, false, false, false],
                [false, false, true, true, false],
                [false, true, false, true, false],
                [false, false, true, true, false],
                [false, false, false, false, false],
            ]);

            qrCode = new TestClass('test', { padding: 3 });
            expect(qrCode.getQrCodeData(source)).toEqual([
                [false, false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false, false],
                [false, false, false, false, true, true, false, false, false],
                [false, false, false, true, false, true, false, false, false],
                [false, false, false, false, true, true, false, false, false],
                [false, false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false, false],
            ]);
        });

        it('should invert data with padding', () => {
            const source = [
                [false, true, true],
                [true, false, true],
                [false, true, true],
            ];

            qrCode = new TestClass('test', { padding: 3, invert: true });
            expect(qrCode.getQrCodeData(source)).toEqual([
                [true, true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true, true],
                [true, true, true, true, false, false, true, true, true],
                [true, true, true, false, true, false, true, true, true],
                [true, true, true, true, false, false, true, true, true],
                [true, true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true, true],
                [true, true, true, true, true, true, true, true, true],
            ]);
        });
    });

    describe('getData', () => {
        class TestClass extends QRCodeRaw {

            setQrCodeData(data: QRCodeDataType | null) {
                return this._qrCodeData = data;
            }

            getQrCodeData() {
                return this._qrCodeData;
            }

        }
        let qrCode: TestClass;

        beforeEach(() => {
            qrCode = new TestClass('test', { padding: 0 });
        });

        it('should return cached data', () => {
            qrCode.setQrCodeData([[true, true], [false, false]]);
            expect(qrCode.getData()).toEqual([[true, true], [false, false]]);
        });

        it('should throw an error on error if errorsEnable is true', () => {
            qrCode = new TestClass('bad', { padding: 0, errorsEnabled: true });
            expect(() => { qrCode.getData(); }).toThrowError();
        });

        it('should return null on error if errorsEnable is false', () => {
            qrCode = new TestClass('bad', { padding: 0, errorsEnabled: false });
            expect(qrCode.getData()).toBeNull();
        });

        it('should return data of QR code', () => {
            qrCode = new TestClass('good', { padding: 0 });
            expect(qrCode.getData()).toEqual([[true, true], [false, false]]);
        });
    });

});
