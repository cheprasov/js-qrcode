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

import type { OptionsInf as ParentOptionsInf, QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './color/ColorUtils';
import type { ImageConfigInf } from './AbstractQRCodeWithImage';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';
import ImageLoader from './loader/ImageLoader';
import { CanvasInf } from "./canvas/CanvasInf";
import { ImageInf } from "./image/ImageInf";

export interface OptionsType extends ParentOptionsInf {
    fgColor: string,
    bgColor: string,
    scale: number,
    size: number,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
    scale: 10,
    size: null,
};

export default class QRCodeCanvas extends AbstractQRCodeWithImage<ImageInf | CanvasInf | Promise<ImageInf>> {

    protected _scale: number;
    protected _size: number | null;

    protected _canvas: HTMLCanvasElement;
    protected _canvasContext: CanvasRenderingContext2D;

    constructor(value: string, options: Partial<OptionsType> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this._scale = params.scale;
        this._size = params.size;

        this._canvas = document.createElement('canvas');
        this._canvasContext = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    _clearCache(): void {
        super._clearCache();
        this._canvas.width = 0;
    }

    _getCanvasSize(): number | null {
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        if (this._size) {
            return this._size;
        }
        if (this._scale) {
            return this._scale * dataSize;
        }
        return dataSize;
    }

    draw(canvas: HTMLCanvasElement | null = null): HTMLCanvasElement | Promise<CanvasInf> | null {
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }

        const data: QRCodeDataType | null = this.getData();
        if (!data) {
            return null;
        }

        const fgColor = ColorUtils.convertHexColorToBytes(this._fgColor);
        const bgColor = ColorUtils.convertHexColorToBytes(this._bgColor);

        let index = 0;
        const bytes = new Uint8ClampedArray((dataSize ** 2) * 4);
        data.forEach((row: boolean[]) => {
            row.forEach((isBlack: boolean) => {
                if (isBlack) {
                    bytes.set(fgColor, index);
                } else {
                    bytes.set(bgColor, index);
                }
                index += 4;
            });
        });

        const imageData = new ImageData(bytes, dataSize, dataSize);

        this._canvas.width = dataSize;
        this._canvas.height = dataSize;
        this._canvasContext.putImageData(imageData, 0, 0);

        const canvasSize = this._getCanvasSize() || 0;

        const qrCodeCanvas = canvas || document.createElement('canvas');
        qrCodeCanvas.width = canvasSize;
        qrCodeCanvas.height = canvasSize;

        const qrCodeCanvasContext = qrCodeCanvas.getContext('2d') as CanvasRenderingContext2D;
        qrCodeCanvasContext.imageSmoothingEnabled = false;
        qrCodeCanvasContext.drawImage(this._canvas, 0, 0, canvasSize, canvasSize);

        const drawImageResult = this._drawImage(qrCodeCanvasContext, canvasSize / dataSize);
        if (drawImageResult instanceof Promise) {
            return drawImageResult.then(() => {
                return qrCodeCanvas;
            });
        }
        return qrCodeCanvas;
    }

    _getImageSource(imageConfig: ImageConfigInf): null | ImageInf | CanvasInf | Promise<ImageInf> {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return ImageLoader.load(this._imageConstructor, source).then((image: ImageInf) => {
                // @ts-ignore
                this._imageConfig.source = image;
                // @ts-ignore
                imageConfig.source = image;
                return image as ImageInf;
            });
        }
        if (source instanceof Image || source instanceof HTMLImageElement) {
            return source;
        }
        if (source instanceof HTMLCanvasElement) {
            return source;
        }
        return null;
    }

    _drawImage(qrCodeCanvasContext: CanvasRenderingContext2D, pixelSize: number): null | true | Promise<void> {
        const imageConfig = this._getImageCompiledConfig();
        if (!imageConfig) {
            return null;
        }

        // @ts-ignore
        if (imageConfig.source instanceof Promise) {
            return imageConfig.source.then((image: ImageInf) => {
                qrCodeCanvasContext.drawImage(
                    // @ts-ignore
                    image,
                    imageConfig.x * pixelSize,
                    imageConfig.y * pixelSize,
                    imageConfig.width * pixelSize,
                    imageConfig.height * pixelSize,
                );
            });
        }

        qrCodeCanvasContext.drawImage(
            // @ts-ignore
            imageConfig.source,
            imageConfig.x * pixelSize,
            imageConfig.y * pixelSize,
            imageConfig.width * pixelSize,
            imageConfig.height * pixelSize,
        );

        return true;
    }

    getCanvas(): null | HTMLCanvasElement | Promise<CanvasInf> {
        return this.draw();
    }

    toDataUrl(type: string = 'image/png', encoderOptions: number = 0.92): null | string | Promise<string> {
        const canvasOrPromise = this.draw();
        if (!canvasOrPromise) {
            return null;
        }
        if (canvasOrPromise instanceof Promise) {
            return canvasOrPromise.then((qrCodeCanvas) => {
                return qrCodeCanvas.toDataURL(type, encoderOptions);
            });
        }
        return canvasOrPromise.toDataURL(type, encoderOptions);
    }

}
