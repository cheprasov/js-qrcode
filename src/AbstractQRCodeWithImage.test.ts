/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractQRCodeWithImage, { ImageCompiledConfigInf, ImageConfigInf } from './AbstractQRCodeWithImage';
import { ImageInf } from "./image/ImageInf";
import { CanvasInf } from "./canvas/CanvasInf";

jest.mock('qr.js/lib/QRCode', () => {
    return class {

        modules: boolean[][] | null = null;

        make() {
            this.modules = [
                [true, true, true, true, true],
                [true, false, false, false, true],
                [true, false, true, false, true],
                [true, false, false, false, true],
                [true, true, true, true, true],
            ];
        }

        addData = (value: string) => {
            if (value === 'bad') {
                throw new Error('Some error');
            }
        }

    }
});

describe('AbstractQRCodeWithImage', () => {

    describe('constructor', () => {
        class TestClass extends AbstractQRCodeWithImage {

            getImageConfig() {
                return super._getImageCompiledConfig();
            }

        }

        it('should use default params if nothing is provided', () => {
            const qrCode = new TestClass('');
            expect(qrCode.getImageConfig()).toBeNull();
        });

        it('should use specified params', () => {
            const qrCode = new TestClass(
                'test 84',
                {
                    invert: true,
                    errorsEnabled: true,
                    padding: 3,
                    image: {
                        source: 'some-url.png',
                        width: 100,
                        height: 100,
                        x: 0,
                        y: 0,
                        border: null,
                    },
                },
            );
            expect(qrCode.getImageConfig()).toEqual({
                source: 'some-url.png',
                width: 100,
                height: 100,
                x: 3,
                y: 3,
                border: null,
            });
        });
    });

    describe('_clearCache', () => {
        class TestClass extends AbstractQRCodeWithImage {

            setImageCompiledConfig(cfg: ImageCompiledConfigInf) {
                this._imageCompiledConfig = cfg;
            }

            getImageCompiledConfig() {
                return this._imageCompiledConfig;
            }

            callClearCache() {
                this._clearCache();
            }

        }

        it('should clear TestClass and qrCodeText', () => {
            const qrCode = new TestClass('test');
            qrCode.setImageCompiledConfig({
                source: 'some-url.png',
                width: 100,
                height: 100,
                x: 0,
                y: 0,
                border: null,
            });
            qrCode.callClearCache();
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });
    });

    describe('_getImageSource', () => {
        class TestClass extends AbstractQRCodeWithImage {

            getImageSource(cfg: ImageConfigInf) {
                return this._getImageSource(cfg);
            }

        }

        it('should return string if string is passed', () => {
            const qrCode = new TestClass('test');
            expect(qrCode.getImageSource({ source: 'foo-bar.png' } as ImageConfigInf)).toEqual('foo-bar.png');
        });

        it('should return Image.src if passed object is instance of Image', () => {
            const qrCode = new TestClass('test');
            const img: ImageInf = {
                width: 100,
                height: 100,
                naturalWidth: 100,
                naturalHeight: 100,
                alt: '',
                src: 'https://some-url.com/foo.png',
                complete: true,
                onload: null,
            };
            expect(qrCode.getImageSource({ source: img } as any)).toEqual('https://some-url.com/foo.png');
        });

        it('should return Canvas.toDataUrl if Canvas is passed', () => {
            const qrCode = new TestClass('test');
            const canvas: CanvasInf = {
                width: 100,
                height: 100,
                getContext: () => null,
                toDataURL: jest.fn(() => 'data:foo-bar'),
            };
            expect(qrCode.getImageSource({ source: canvas } as any)).toEqual('data:foo-bar');
            expect(canvas.toDataURL).toHaveBeenCalledTimes(1);
        });

        it('should return null if source has wrong type', () => {
            const qrCode = new TestClass('test');
            expect(qrCode.getImageSource({ source: true } as any)).toEqual(null);
            expect(qrCode.getImageSource({ source: 42 } as any)).toEqual(null);
            expect(qrCode.getImageSource({ source: undefined } as any)).toEqual(null);
            expect(qrCode.getImageSource({ source: null } as any)).toEqual(null);
        });
    });

    describe('_getImageCompiledConfig', () => {
        class TestClass extends AbstractQRCodeWithImage {

            setImageConfig(cfg: any) {
                this._imageConfig = cfg;
            }

            getImageConfig() {
                return this._imageConfig as any;
            }

            setImageCompiledConfig(cfg: any) {
                this._imageCompiledConfig = cfg;
            }

            getImageCompiledConfig() {
                return this._getImageCompiledConfig();
            }

            setPadding(value: any) {
                this._padding = value;
            }

        }

        let qrCode: TestClass;

        beforeEach(() => {
            qrCode = new TestClass('test', {
                padding: 0,
                image: {
                    source: 'https://someurl.com/img.png',
                    width: 10,
                    height: 10,
                    border: 0,
                    x: 0,
                    y: 0,
                },
            });
            qrCode.getDataSize = jest.fn(() => 42);
        });

        it('should return cached imageConfig', () => {
            qrCode.setImageCompiledConfig({ foo: 'bar' });
            expect(qrCode.getImageCompiledConfig()).toEqual({ foo: 'bar' });
        });

        it('should return null if image is not provided', () => {
            qrCode.setImageConfig(null);
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });

        it('should return null if image.source is not provided', () => {
            qrCode.getImageConfig().source = null;
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });

        it('should return null if image.width is not provided', () => {
            qrCode.getImageConfig().width = null;
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });
        //
        it('should return null if image.height is not provided', () => {
            qrCode.getImageConfig().height = null;
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });

        it('should return null if dataSize is empty', () => {
            qrCode.getDataSize = jest.fn(() => 0);
            expect(qrCode.getImageCompiledConfig()).toBeNull();
        });

        it('should return imageConfig if dataSize is empty', () => {
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'https://someurl.com/img.png',
                border: 0,
                width: 10,
                height: 10,
                x: 0,
                y: 0,
            });
        });

        it('should return increase X & Y on padding size', () => {
            qrCode.setPadding(4);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'https://someurl.com/img.png',
                border: 0,
                width: 10,
                height: 10,
                x: 4,
                y: 4,
            });

            qrCode.setImageCompiledConfig(null);
            qrCode.getImageConfig().x = 'right';
            qrCode.getImageConfig().y = 'center';
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'https://someurl.com/img.png',
                border: 0,
                width: 10,
                height: 10,
                x: 28,
                y: 16,
            });
        });

        it('should calculate width and height without padding', () => {
            qrCode.setPadding(5);
            qrCode.getImageConfig().width = '100%';
            qrCode.getImageConfig().height = '50%';
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'https://someurl.com/img.png',
                border: 0,
                width: 32,
                height: 16,
                x: 5,
                y: 5,
            });
        });
    });

    describe('getData', () => {
        class TestClass extends AbstractQRCodeWithImage {

            getImageCompiledConfig() {
                return this._getImageCompiledConfig();
            }

        }

        it('should not change data if image is not provided', () => {
            const qrCode = new TestClass('test');
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, true, false, true, false],
                [false, true, false, false, false, true, false],
                [false, true, true, true, true, true, false],
                [false, false, false, false, false, false, false],
            ]);
        });

        it('should not change data if image.border is not number', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'center',
                    y: 'center',
                    width: 5,
                    height: 5,
                    border: null,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, true, false, true, false],
                [false, true, false, false, false, true, false],
                [false, true, true, true, true, true, false],
                [false, false, false, false, false, false, false],
            ]);
        });

        it('should remove data under image if image.border is 0', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'right',
                    y: 'bottom',
                    width: 3,
                    height: 2,
                    border: 0,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, true, false, true, false],
                [false, true, false, false, false, false, false],
                [false, true, true, false, false, false, false],
                [false, false, false, false, false, false, false],
            ]);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'foo.png',
                x: 3,
                y: 4,
                width: 3,
                height: 2,
                border: 0,
            });
        });

        it('should remove data under image and border if image.border is greater than 0', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'right',
                    y: 'bottom',
                    width: 3,
                    height: 2,
                    border: 1,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, false, false, false, false],
                [false, true, false, false, false, false, false],
                [false, true, false, false, false, false, false],
                [false, false, false, false, false, false, false],
            ]);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'foo.png',
                x: 3,
                y: 4,
                width: 3,
                height: 2,
                border: 1,
            });
        });

        it('should use default border = 1if image.border is not provided', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'right',
                    y: 'bottom',
                    width: 3,
                    height: 2,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, false, false, false, false],
                [false, true, false, false, false, false, false],
                [false, true, false, false, false, false, false],
                [false, false, false, false, false, false, false],
            ]);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'foo.png',
                x: 3,
                y: 4,
                width: 3,
                height: 2,
                border: 1,
            });
        });

        it('should remove data under image and min border if image.border is less than 0', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'center',
                    y: 'center',
                    width: 5,
                    height: 5,
                    border: -1,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, true, true, true, true, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, false, false, true, false],
                [false, true, false, false, false, true, false],
                [false, true, true, true, true, true, false],
                [false, false, false, false, false, false, false],
            ]);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'foo.png',
                x: 1,
                y: 1,
                width: 5,
                height: 5,
                border: -1,
            });
        });

        it('should calculate well inverted data', () => {
            const qrCode = new TestClass('test', {
                invert: true,
                image: {
                    source: 'foo.png',
                    x: 'right',
                    y: 'bottom',
                    width: 3,
                    height: 2,
                    border: 0,
                },
            });
            expect(qrCode.getData()).toEqual([
                [true, true, true, true, true, true, true],
                [true, false, false, false, false, false, true],
                [true, false, true, true, true, false, true],
                [true, false, true, false, true, false, true],
                [true, false, true, true, true, true, true],
                [true, false, false, true, true, true, true],
                [true, true, true, true, true, true, true],
            ]);
            expect(qrCode.getImageCompiledConfig()).toEqual({
                source: 'foo.png',
                x: 3,
                y: 4,
                width: 3,
                height: 2,
                border: 0,
            });
        });

        it('should calculate well large border', () => {
            const qrCode = new TestClass('test', {
                image: {
                    source: 'foo.png',
                    x: 'center',
                    y: 'center',
                    width: 1,
                    height: 1,
                    border: 100,
                },
            });
            expect(qrCode.getData()).toEqual([
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false],
            ]);
        });
    });

});
