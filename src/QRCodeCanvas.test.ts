/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
// @ts-nocheck

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

HTMLCanvasElement.prototype.getContext = jest.fn(function() {
    this.mockedContext = new MockCanvasRenderingContext2D();
    return this.mockedContext;
});

describe('QRCodeCanvas', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new QRCodeCanvas();
            expect(qrCode._value).toBeUndefined();
            expect(qrCode._padding).toEqual(1);
            expect(qrCode._level).toEqual('L');
            expect(qrCode._typeNumber).toEqual(0);
            expect(qrCode._areErrorsEnabled).toBeFalsy();
            expect(qrCode._isInvert).toBeFalsy();
            expect(qrCode._fgColor).toEqual('#000');
            expect(qrCode._bgColor).toEqual('#FFF');
            expect(qrCode._scale).toEqual(10);
            expect(qrCode._size).toBeNull();
        });

        it('should default params for not specified params', () => {
            const qrCode = new QRCodeCanvas('test 42', { level: 'Q', size: 100 });
            expect(qrCode._value).toEqual('test 42');
            expect(qrCode._padding).toEqual(1);
            expect(qrCode._level).toEqual('Q');
            expect(qrCode._typeNumber).toEqual(0);
            expect(qrCode._areErrorsEnabled).toBeFalsy();
            expect(qrCode._isInvert).toBeFalsy();
            expect(qrCode._fgColor).toEqual('#000');
            expect(qrCode._bgColor).toEqual('#FFF');
            expect(qrCode._scale).toEqual(10);
            expect(qrCode._size).toEqual(100);
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
            expect(qrCode._value).toEqual('test 84');
            expect(qrCode._padding).toEqual(0);
            expect(qrCode._level).toEqual('H');
            expect(qrCode._typeNumber).toEqual(20);
            expect(qrCode._areErrorsEnabled).toBeTruthy();
            expect(qrCode._isInvert).toBeTruthy();
            expect(qrCode._fgColor).toEqual('#AAAA');
            expect(qrCode._bgColor).toEqual('#FFF0');
            expect(qrCode._scale).toEqual(11);
            expect(qrCode._size).toEqual(100);
        });

        it('should create alias toDataURL for method toDataUrl', () => {
            const qrCode = new QRCodeCanvas('test');
            expect(qrCode.toDataURL).toBe(qrCode.toDataUrl);
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode._qrCodeData = [1, 2, 3, 4];
            qrCode._clearCache();
            expect(qrCode._qrCodeData).toBeNull();
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

    describe('_getImageSource', () => {
        it('should return promise if string is passed', () => {
            const qrCode = new QRCodeCanvas('test');
            expect(qrCode._getImageSource({ source: 'foo-bar.png' })).toBeInstanceOf(Promise);
        });

        it('should return Image if Image is passed', () => {
            const qrCode = new QRCodeCanvas('test');
            const img = new Image();
            img.src = 'https://some-url.com/foo.png';
            expect(qrCode._getImageSource({ source: img })).toEqual(img);
        });

        it('should return Canvas if Canvas is passed', () => {
            const qrCode = new QRCodeCanvas('test');
            const canvas = document.createElement('canvas');
            expect(qrCode._getImageSource({ source: canvas })).toEqual(canvas);
        });

        it('should return null if source has wrong type', () => {
            const qrCode = new QRCodeCanvas('test');
            expect(qrCode._getImageSource({ source: true })).toEqual(null);
            expect(qrCode._getImageSource({ source: 42 })).toEqual(null);
            expect(qrCode._getImageSource({ source: undefined })).toEqual(null);
            expect(qrCode._getImageSource({ source: null })).toEqual(null);
        });
    });

    describe('_drawImage', () => {
        let qrCode;
        let imageConfig;
        let qrCodeCanvasContext = {
            drawImage: jest.fn(),
        };
        let pixelSize = 10;

        beforeEach(() => {
            qrCode = new QRCodeCanvas('test');
            imageConfig = {
                source: new Image(),
                width: 10,
                height: 12,
                x: 1,
                y: 2,
                border: null,
            };
            qrCode._getImageConfig = jest.fn(() => imageConfig);
        });

        it('should return null if imageConfig is not provided', () => {
            imageConfig = null;
            expect(qrCode._drawImage(qrCodeCanvasContext, pixelSize)).toBeNull();
        });

        it('should return promise if source is a promise', () => {
            const img = new Image();
            const promise = Promise.resolve(img);
            imageConfig.source = promise;
            expect(qrCode._drawImage(qrCodeCanvasContext, pixelSize)).toEqual(promise);
            expect(qrCodeCanvasContext.drawImage).not.toHaveBeenCalled();
            return promise.then(() => {
                expect(qrCodeCanvasContext.drawImage).toHaveBeenCalledWith(img, 10, 20, 100, 120);
            });
        });

        it('should return true if source is an Image', () => {
            const img = new Image();
            imageConfig.source = img;
            expect(qrCode._drawImage(qrCodeCanvasContext, pixelSize)).toEqual(true);
            expect(qrCodeCanvasContext.drawImage).toHaveBeenCalledWith(img, 10, 20, 100, 120);
        });

        it('should return true if source is a canvas', () => {
            const canvas = document.createElement('canvas');
            imageConfig.source = canvas;
            expect(qrCode._drawImage(qrCodeCanvasContext, pixelSize)).toEqual(true);
            expect(qrCodeCanvasContext.drawImage).toHaveBeenCalledWith(canvas, 10, 20, 100, 120);
        });
    });

    describe('getCanvas', () => {
        it('should return result of call draw()', () => {
            const qrCode = new QRCodeCanvas('test');

            qrCode.draw = jest.fn(() => null);
            expect(qrCode.getCanvas()).toBeNull();

            const canvas = document.createElement('canvas');
            qrCode.draw = jest.fn(() => canvas);
            expect(qrCode.getCanvas()).toBe(canvas);

            qrCode.draw = jest.fn(() => Promise.resolve(canvas));
            expect(qrCode.getCanvas()).toBeInstanceOf(Promise);
        });
    });

    describe('draw', () => {
        it('should return null if dataSize is empty', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.getDataSize = jest.fn(() => null);
            expect(qrCode.draw()).toBeNull();
        });

        it('should return null if data are empty', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.getData = jest.fn(() => null);
            expect(qrCode.draw()).toBeNull();
        });

        it('should draw QR code and return new canvas', () => {
            const qrCode = new QRCodeCanvas('test', { bgColor: '#05060700', fgColor: '#01020304', scale: 8 });
            qrCode.getData = jest.fn(() => [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, true, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ]);
            const qrCodeCanvas = qrCode.draw();
            expect(qrCodeCanvas).toBeInstanceOf(HTMLCanvasElement);
            expect(qrCode._canvasContext.putImageData).toHaveBeenCalledTimes(1);
            const putImageDataArgs = qrCode._canvasContext.putImageData.mock.calls[0];
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

            expect(qrCode._canvas.width).toEqual(5);
            expect(qrCode._canvas.height).toEqual(5);

            expect(putImageDataArgs[1]).toEqual(0);
            expect(putImageDataArgs[2]).toEqual(0);

            expect(qrCodeCanvas.mockedContext.imageSmoothingEnabled).toEqual(false);
            expect(qrCodeCanvas.width).toEqual(40);
            expect(qrCodeCanvas.height).toEqual(40);
            expect(qrCodeCanvas.mockedContext.drawImage).toHaveBeenCalledWith(qrCode._canvas, 0, 0, 40, 40);
        });

        it('should draw QR code and return provided canvas', () => {
            const qrCode = new QRCodeCanvas('test', { bgColor: '#05060700', fgColor: '#01020304', scale: 8 });
            qrCode.getData = jest.fn(() => [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, true, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ]);
            const canvas = document.createElement('canvas');
            const qrCodeCanvas = qrCode.draw(canvas);
            expect(qrCodeCanvas).toBeInstanceOf(HTMLCanvasElement);
            expect(qrCodeCanvas).toBe(canvas);
            expect(qrCode._canvasContext.putImageData).toHaveBeenCalledTimes(1);
            const putImageDataArgs = qrCode._canvasContext.putImageData.mock.calls[0];
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

            expect(qrCode._canvas.width).toEqual(5);
            expect(qrCode._canvas.height).toEqual(5);

            expect(putImageDataArgs[1]).toEqual(0);
            expect(putImageDataArgs[2]).toEqual(0);

            expect(qrCodeCanvas.mockedContext.imageSmoothingEnabled).toEqual(false);
            expect(qrCodeCanvas.width).toEqual(40);
            expect(qrCodeCanvas.height).toEqual(40);
            expect(qrCodeCanvas.mockedContext.drawImage).toHaveBeenCalledWith(qrCode._canvas, 0, 0, 40, 40);
        });
    });

    describe('toDataURL', () => {
        let canvas;

        beforeEach(() => {
            HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:url');
            canvas = document.createElement('canvas');
        });

        it('should return null if canvas is not drawn', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.draw = jest.fn(() => null);
            expect(qrCode.toDataUrl()).toBeNull();
        });

        it('should return promise if draws returns a promise', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.draw = jest.fn(() => Promise.resolve(canvas));
            const result = qrCode.toDataUrl();
            expect(result).toBeInstanceOf(Promise);
            return result.then((url) => {
                expect(url).toEqual('data:url');
            });
        });

        it('should return string if draws returns a canvas', () => {
            const qrCode = new QRCodeCanvas('test');
            qrCode.draw = jest.fn(() => canvas);
            expect(qrCode.toDataUrl()).toEqual('data:url');
        });
    });

});
