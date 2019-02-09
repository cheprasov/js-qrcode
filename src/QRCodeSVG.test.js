import QRCodeSVG from './QRCodeSVG';

describe('QRCodeSVG', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeSVG();
            expect(qrCode.value).toBeUndefined();
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('L');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.fgColor).toEqual('#000');
            expect(qrCode.bgColor).toEqual('#FFF');
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeSVG('test 42', { level: 'Q' });
            expect(qrCode.value).toEqual('test 42');
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('Q');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.fgColor).toEqual('#000');
            expect(qrCode.bgColor).toEqual('#FFF');
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeSVG(
                'test 84',
                {
                    level: 'H',
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                    fgColor: '#AAA',
                    bgColor: '#FFF',
                },
            );
            expect(qrCode.value).toEqual('test 84');
            expect(qrCode.padding).toEqual(0);
            expect(qrCode.level).toEqual('H');
            expect(qrCode.typeNumber).toEqual(20);
            expect(qrCode.errorsEnabled).toBeTruthy();
            expect(qrCode.invert).toBeTruthy();
            expect(qrCode.fgColor).toEqual('#AAA');
            expect(qrCode.bgColor).toEqual('#FFF');
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new QRCodeSVG('test');
            qrCode.qrCodeData = [1, 2, 3, 4];
            qrCode.qrCodeHTML = '<svg />';
            qrCode.qrCodeDataUrl = 'data:some-42';
            qrCode._clearCache();
            expect(qrCode.qrCodeData).toBeNull();
            expect(qrCode.qrCodeDataUrl).toBeNull();
        });
    });

    describe('_getDataInt', () => {
        it('should return null if data are empty', () => {
            const qrCode = new QRCodeSVG('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode._getDataInt()).toBeNull();
        });

        it('should convert boolean[][] to number[][]', () => {
            const qrCode = new QRCodeSVG('test');
            qrCode.getData = jest.fn(() => [
                [true, true, true, true],
                [false, true, true, false],
                [true, false, false, true],
                [true, true, true, true],
            ]);
            expect(qrCode._getDataInt()).toEqual([
                [1, 1, 1, 1],
                [0, 1, 1, 0],
                [1, 0, 0, 1],
                [1, 1, 1, 1],
            ]);
        });

        it('should return qr code data int', () => {
            const qrCode = new QRCodeSVG('test');
            expect(qrCode._getDataInt()).toEqual([
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0],
                [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0],
                [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0],
                [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0],
                [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0],
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            ]);
        });
    });

    describe('_getRects', () => {
        it('should return null if qr code data are empty', () => {
            const qrCode = new QRCodeSVG('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode._getRects()).toBeNull();
        });

        it('should return rects from qr code data', () => {
            const qrCode = new QRCodeSVG('test');
            qrCode._getDataInt = jest.fn(() => [
                //  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], // 1
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 2
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 3
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 4
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0], // 5
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], // 6
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0], // 7
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 8
                [0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0], // 9
                [0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0], // 10
                [0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0], // 11
                [0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0], // 12
                [0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0], // 13
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0], // 14
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0], // 15
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0], // 16
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0], // 17
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0], // 18
                [0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0], // 19
                [0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0], // 20
                [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], // 21
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 22
            ]);

            expect(qrCode._getRects()).toEqual([
                { x: 1, y: 1, width: 7, height: 1 },
                { x: 9, y: 1, width: 2, height: 1 },
                { x: 13, y: 1, width: 1, height: 3 },
                { x: 15, y: 1, width: 7, height: 1 },
                { x: 1, y: 2, width: 1, height: 6 },
                { x: 7, y: 2, width: 1, height: 6 },
                { x: 10, y: 2, width: 1, height: 1 },
                { x: 15, y: 2, width: 1, height: 6 },
                { x: 21, y: 2, width: 1, height: 6 },
                { x: 3, y: 3, width: 3, height: 3 },
                { x: 9, y: 3, width: 1, height: 3 },
                { x: 11, y: 3, width: 1, height: 1 },
                { x: 17, y: 3, width: 3, height: 3 },
                { x: 12, y: 4, width: 1, height: 1 },
                { x: 9, y: 5, width: 3, height: 1 },
                { x: 1, y: 7, width: 7, height: 1 },
                { x: 9, y: 7, width: 1, height: 1 },
                { x: 11, y: 7, width: 1, height: 9 },
                { x: 13, y: 7, width: 1, height: 1 },
                { x: 15, y: 7, width: 7, height: 1 },
                { x: 10, y: 8, width: 2, height: 1 },
                { x: 1, y: 9, width: 4, height: 1 },
                { x: 7, y: 9, width: 1, height: 1 },
                { x: 9, y: 9, width: 1, height: 1 },
                { x: 14, y: 9, width: 1, height: 1 },
                { x: 17, y: 9, width: 3, height: 1 },
                { x: 21, y: 9, width: 1, height: 3 },
                { x: 1, y: 10, width: 1, height: 3 },
                { x: 4, y: 10, width: 3, height: 1 },
                { x: 8, y: 10, width: 1, height: 1 },
                { x: 13, y: 10, width: 1, height: 3 },
                { x: 16, y: 10, width: 1, height: 2 },
                { x: 18, y: 10, width: 2, height: 1 },
                { x: 3, y: 11, width: 1, height: 3 },
                { x: 5, y: 11, width: 3, height: 1 },
                { x: 13, y: 11, width: 5, height: 1 },
                { x: 20, y: 11, width: 2, height: 1 },
                { x: 3, y: 12, width: 2, height: 1 },
                { x: 8, y: 12, width: 2, height: 1 },
                { x: 13, y: 12, width: 2, height: 1 },
                { x: 18, y: 12, width: 1, height: 5 },
                { x: 20, y: 12, width: 1, height: 3 },
                { x: 2, y: 13, width: 2, height: 1 },
                { x: 5, y: 13, width: 1, height: 1 },
                { x: 7, y: 13, width: 1, height: 1 },
                { x: 10, y: 13, width: 3, height: 1 },
                { x: 14, y: 13, width: 1, height: 4 },
                { x: 17, y: 13, width: 2, height: 1 },
                { x: 9, y: 14, width: 1, height: 1 },
                { x: 16, y: 14, width: 1, height: 1 },
                { x: 1, y: 15, width: 7, height: 1 },
                { x: 14, y: 15, width: 2, height: 2 },
                { x: 17, y: 15, width: 3, height: 1 },
                { x: 1, y: 16, width: 1, height: 6 },
                { x: 7, y: 16, width: 1, height: 6 },
                { x: 10, y: 16, width: 1, height: 3 },
                { x: 12, y: 16, width: 4, height: 1 },
                { x: 18, y: 16, width: 2, height: 1 },
                { x: 3, y: 17, width: 3, height: 3 },
                { x: 10, y: 17, width: 3, height: 1 },
                { x: 15, y: 17, width: 1, height: 1 },
                { x: 19, y: 17, width: 3, height: 1 },
                { x: 9, y: 18, width: 2, height: 1 },
                { x: 14, y: 18, width: 1, height: 2 },
                { x: 17, y: 18, width: 2, height: 1 },
                { x: 20, y: 18, width: 1, height: 1 },
                { x: 9, y: 19, width: 1, height: 3 },
                { x: 11, y: 19, width: 2, height: 2 },
                { x: 17, y: 19, width: 1, height: 2 },
                { x: 19, y: 19, width: 1, height: 1 },
                { x: 9, y: 20, width: 5, height: 1 },
                { x: 15, y: 20, width: 1, height: 1 },
                { x: 17, y: 20, width: 2, height: 1 },
                { x: 21, y: 20, width: 1, height: 1 },
                { x: 1, y: 21, width: 7, height: 1 },
                { x: 9, y: 21, width: 2, height: 1 },
                { x: 12, y: 21, width: 2, height: 1 },
                { x: 16, y: 21, width: 1, height: 1 }
            ]);
        });
    });

    describe('_processRect', () => {
        let qrCode;

        beforeEach(() => {
            qrCode = new QRCodeSVG('test');
        });

        it('should return null if rect has any new block', () => {
            const dataInt = [
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
            ];
            expect(qrCode._processRect(dataInt, 0, 2, 0)).toBeNull();
            expect(qrCode._processRect(dataInt, 4, 6, 0)).toBeNull();
            expect(qrCode._processRect(dataInt, 10, 2, 0)).toBeNull();
            expect(qrCode._processRect(dataInt, 4, 6, 3)).toBeNull();
            expect(qrCode._processRect(dataInt, 1, 2, 0)).toBeNull();
            expect(qrCode._processRect(dataInt, 9, 10, 1)).toBeNull();
        });

        it('should return calculate single block', () => {
            const dataInt = [
                [1, 0, 1, 0],
                [0, 1, 0, 1],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
            ];
            expect(qrCode._processRect(dataInt, 0, 0, 0)).toEqual({ x: 0, y: 0, width: 1, height: 1 });
            expect(dataInt).toEqual([
                [2, 0, 1, 0],
                [0, 1, 0, 1],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
            ]);
            expect(qrCode._processRect(dataInt, 1, 1, 1)).toEqual({ x: 1, y: 1, width: 1, height: 1 });
            expect(dataInt).toEqual([
                [2, 0, 1, 0],
                [0, 2, 0, 1],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
            ]);
            expect(qrCode._processRect(dataInt, 3, 3, 1)).toEqual({ x: 3, y: 1, width: 1, height: 1 });
            expect(dataInt).toEqual([
                [2, 0, 1, 0],
                [0, 2, 0, 2],
                [1, 0, 1, 0],
                [0, 1, 0, 1],
            ]);
        });

        it('should return rect if it has at least one new block', () => {
            const dataInt = [
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 1, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 1, 0, 2, 1, 2, 0], // 3
            ];

            expect(qrCode._processRect(dataInt, 1, 2, 0)).toEqual({ x: 1, y: 0, width: 2, height: 3 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 1, 0, 2, 1, 2, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 4, 6, 2)).toEqual({ x: 4, y: 2, width: 3, height: 2 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 2, 1, 2, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 8, 10, 3)).toEqual({ x: 8, y: 3, width: 3, height: 1 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
            ]);
        });

        it('should return full rect and mark checked area as processed', () => {
            const dataInt = [
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1], // 0
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
                [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
            ];

            expect(qrCode._processRect(dataInt, 0, 2, 0)).toEqual({ x: 0, y: 0, width: 3, height: 1 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 1, 1, 1, 0, 0, 1, 1, 1], // 0
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
                [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 4, 6, 0)).toEqual({ x: 4, y: 0, width: 3, height: 1 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 1, 1, 1], // 0
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1], // 1
                [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 9, 11, 0)).toEqual({ x: 9, y: 0, width: 3, height: 2 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 1, 1, 0, 0, 1, 0, 0, 0, 2, 2, 2], // 1
                [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 1, 2, 1)).toEqual({ x: 1, y: 1, width: 2, height: 2 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 1, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 1, 1, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 5, 5, 1)).toEqual({ x: 5, y: 1, width: 1, height: 3 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 9, 11, 1)).toBeNull();
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 1, 2, 2)).toBeNull();
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 1, 2, 1, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 1, 2, 1, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 4, 6, 2)).toEqual({ x: 4, y: 2, width: 3, height: 2 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 1, 1, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 1, 1, 1, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 9, 10, 2)).toEqual({ x: 9, y: 2, width: 2, height: 2 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 1, 2, 2, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 4, 6, 3)).toBeNull();
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 1, 2, 2, 0], // 3
            ]);

            expect(qrCode._processRect(dataInt, 8, 10, 3)).toEqual({ x: 8, y: 3, width: 3, height: 1 });
            expect(dataInt).toEqual([
                //  1  2  3  4  5  6  7  8  9  10 11 x / y
                [2, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 2], // 0
                [0, 2, 2, 0, 0, 2, 0, 0, 0, 2, 2, 2], // 1
                [0, 2, 2, 0, 2, 2, 2, 0, 0, 2, 2, 0], // 2
                [0, 0, 0, 0, 2, 2, 2, 0, 2, 2, 2, 0], // 3
            ]);
        });
    });

});
