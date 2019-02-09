import QRCodeCanvas from './QRCodeCanvas';

global.ImageData = function (bytes, width, height) {
    this.bytes = bytes;
    this.width = width;
    this.height = height;
};

const MockCanvasRenderingContext2D = function () {
    this.putImageData = jest.fn();
    this.drawImage = jest.fn();
    this.imageSmoothingEnabled = true;
};

HTMLCanvasElement.prototype.getContext = jest.fn(() => new MockCanvasRenderingContext2D());

describe('QRCodeCanvas', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeCanvas();
            expect(qrCode.value).toBeUndefined();
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('L');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.fgColor).toEqual('#000');
            expect(qrCode.bgColor).toEqual('#FFF');
            expect(qrCode.scale).toEqual(10);
            expect(qrCode.size).toBeNull();
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeCanvas('test 42', { level: 'Q', size: 100 });
            expect(qrCode.value).toEqual('test 42');
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('Q');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.fgColor).toEqual('#000');
            expect(qrCode.bgColor).toEqual('#FFF');
            expect(qrCode.scale).toEqual(10);
            expect(qrCode.size).toEqual(100);
        });

        it('should use specified params', () => {
            const qrCode = new QRCodeCanvas(
                'test 84',
                {
                    level: 'H',
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                    fgColor: '#AAAA',
                    bgColor: '#FFF0',
                    scale: 11,
                    size: 100,
                },
            );
            expect(qrCode.value).toEqual('test 84');
            expect(qrCode.padding).toEqual(0);
            expect(qrCode.level).toEqual('H');
            expect(qrCode.typeNumber).toEqual(20);
            expect(qrCode.errorsEnabled).toBeTruthy();
            expect(qrCode.invert).toBeTruthy();
            expect(qrCode.fgColor).toEqual('#AAAA');
            expect(qrCode.bgColor).toEqual('#FFF0');
            expect(qrCode.scale).toEqual(11);
            expect(qrCode.size).toEqual(100);
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.qrCodeData = [1, 2, 3, 4];
            qrCode.qrCodeDataUrl = 'data:some-42';
            qrCode._clearCache();
            expect(qrCode.qrCodeData).toBeNull();
            expect(qrCode.qrCodeDataUrl).toBeNull();
        });
    });

    describe('_getCanvasSize', () => {
        it('should return null if dataSize is empty', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.getDataSize = jest.fn(() => null);
            expect(qrCode._getCanvasSize()).toBeNull();
            qrCode.getDataSize = jest.fn(() => 0);
            expect(qrCode._getCanvasSize()).toBeNull();
        });

        it('should return size if it is specified', () => {
            const qrCode = new QRCodeCanvas('test', { size: 42 });
            qrCode.getDataSize = jest.fn(() => 21);
            expect(qrCode._getCanvasSize()).toEqual(42);
        });

        it('should return scaled dataSize if size is not specified', () => {
            const qrCode = new QRCodeCanvas('test', { scale: 5 });
            qrCode.getDataSize = jest.fn(() => 21);
            expect(qrCode._getCanvasSize()).toEqual(105);
        });

        it('should return dataSize if size and scale are not specified', () => {
            const qrCode = new QRCodeCanvas('test', { scale: 0 });
            qrCode.getDataSize = jest.fn(() => 21);
            expect(qrCode._getCanvasSize()).toEqual(21);
        });
    });

    describe('_draw', () => {
        it('should return null if dataSize is empty', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.getDataSize = jest.fn(() => null);
            expect(qrCode._draw()).toBeNull();
        });

        it('should return null if data are empty', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode._draw()).toBeNull();
        });

        it('should draw QR code', () => {
            const qrCode = new QRCodeCanvas('test', { bgColor: '#05060700', fgColor: '#01020304', scale: 8 });
            qrCode.getData = jest.fn(() => [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, true, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ]);
            expect(qrCode._draw()).toEqual(true);
            expect(qrCode.canvasContext.putImageData).toHaveBeenCalledTimes(1);
            const putImageDataArgs = qrCode.canvasContext.putImageData.mock.calls[0];
            const imageData = putImageDataArgs[0];
            expect(imageData).toBeInstanceOf(ImageData);
            expect(imageData.bytes).toBeInstanceOf(Uint8ClampedArray);
            const expectUint8ClampedArray = new Uint8ClampedArray(5 * 5 * 4);
            expectUint8ClampedArray.set([
                1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4,
                1, 2, 3, 4, 5, 6, 7, 0, 5, 6, 7, 0, 5, 6, 7, 0, 1, 2, 3, 4,
                1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4,
                1, 2, 3, 4, 5, 6, 7, 0, 5, 6, 7, 0, 5, 6, 7, 0, 1, 2, 3, 4,
                1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4,
            ], 0);
            expect(imageData.bytes).toEqual(expectUint8ClampedArray);
            expect(imageData.width).toEqual(5);
            expect(imageData.height).toEqual(5);

            expect(qrCode.canvas.width).toEqual(5);
            expect(qrCode.canvas.height).toEqual(5);

            expect(putImageDataArgs[1]).toEqual(0);
            expect(putImageDataArgs[2]).toEqual(0);

            expect(qrCode.qrCodeCanvasContext.imageSmoothingEnabled).toEqual(false);
            expect(qrCode.qrCodeCanvas.width).toEqual(40);
            expect(qrCode.qrCodeCanvas.height).toEqual(40);
            expect(qrCode.qrCodeCanvasContext.drawImage).toHaveBeenCalledWith(qrCode.canvas, 0, 0, 40, 40);
        });
    });

});
