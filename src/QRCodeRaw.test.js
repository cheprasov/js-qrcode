// @flow

import QRCodeRaw from './QRCodeRaw';

let mockQRCode = {};

jest.mock('qr.js/lib/QRCode', () => {
    return function () {
        Object.assign(this, mockQRCode);
    };
});

describe('QRCodeRaw', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeRaw();
            expect(qrCode.value).toBeUndefined();
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('L');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeRaw('test 42', { level: 'Q' });
            expect(qrCode.value).toEqual('test 42');
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('Q');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeRaw(
                'test 84',
                {
                    level: 'H',
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                },
            );
            expect(qrCode.value).toEqual('test 84');
            expect(qrCode.padding).toEqual(0);
            expect(qrCode.level).toEqual('H');
            expect(qrCode.typeNumber).toEqual(20);
            expect(qrCode.errorsEnabled).toBeTruthy();
            expect(qrCode.invert).toBeTruthy();
        });
    });

    describe('setValue', () => {
        it('should set new value and clear cache', () => {
            const qrCode = new QRCodeRaw('test');
            qrCode._clearCache = jest.fn();

            qrCode.setValue('foo 42');
            expect(qrCode.value).toEqual('foo 42');
            expect(qrCode._clearCache).toHaveBeenCalled();
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
            qrCode.getData = jest.fn(() => [1, 2, 3, 4]);
            expect(qrCode.getDataSize()).toEqual(4);
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData', () => {
            const qrCode = new QRCodeRaw('test');
            qrCode.qrCodeData = [1, 2, 3, 4];
            qrCode._clearCache();
            expect(qrCode.qrCodeData).toBeNull();
        });
    });

    describe('_getQrCodeData', () => {
        let qrCode;

        beforeEach(() => {
            qrCode = new QRCodeRaw('test', { padding: 0 });
        });

        it('should return deep cloned arrays', () => {
            const source = [
                [true, true, true],
                [true, false, true],
                [true, true, true],
            ];
            const result = qrCode._getQrCodeData(source);
            expect(result).toEqual(source);
            expect(result).not.toBe(source);
            source[1][1] = true;
            expect(result).not.toEqual(source);
        });

        it('should invert data if the param is enabled', () => {
            const source = [
                [false, true, true],
                [true, false, true],
                [false, true, true],
            ];
            qrCode.invert = true;
            const result = qrCode._getQrCodeData(source);
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
            qrCode.padding = 1;
            expect(qrCode._getQrCodeData(source)).toEqual([
                [false, false, false, false, false],
                [false, false, true, true, false],
                [false, true, false, true, false],
                [false, false, true, true, false],
                [false, false, false, false, false],
            ]);

            qrCode.padding = 3;
            expect(qrCode._getQrCodeData(source)).toEqual([
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

            qrCode.invert = true;
            qrCode.padding = 3;
            expect(qrCode._getQrCodeData(source)).toEqual([
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
        let qrCode;

        beforeEach(() => {
            qrCode = new QRCodeRaw('test', { padding: 0 });
        });

        it('should return cached data', () => {
            qrCode.qrCodeData = [1, 2, 3, 4];
            expect(qrCode.getData()).toEqual([1, 2, 3, 4]);
        });

        it('should throw an error on error if errorsEnable is true', () => {
            qrCode.errorsEnabled = true;
            mockQRCode = {
                addData: () => {
                    throw new Error('Some error');
                },
            };
            expect(() => { qrCode.getData(); }).toThrowError();
        });

        it('should return null on error if errorsEnable is false', () => {
            mockQRCode = {
                addData: () => {
                    throw new Error('Some error');
                },
            };
            expect(qrCode.getData()).toBeNull();
        });

        it('should return data of QR code', () => {
            mockQRCode = {
                addData: jest.fn(),
                make: jest.fn(),
                modules: [[true, true, true], [true, false, true], [true, true, true]],
            };
            expect(qrCode.getData()).toEqual([[true, true, true], [true, false, true], [true, true, true]]);
        });
    });

});
