// @flow

import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './utils/ColorUtils';
import type { ImageConfigType } from './AbstractQRCodeWithImage';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';
import ImageLoader from './loader/ImageLoader';

export type OptionsType = ParentOptionsType & {
    fgColor?: string,
    bgColor?: ?string,
    scale?: number,
    size?: number,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
    scale: 10,
    size: null,
};

export default class QRCodeCanvas extends AbstractQRCodeWithImage {

    fgColor: string;
    bgColor: string;
    scale: number;
    size: ?number;

    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.fgColor = params.fgColor;
        this.bgColor = params.bgColor;
        this.scale = params.scale;
        this.size = params.size;

        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');

        this.toDataURL = this.toDataUrl;
    }

    _clearCache(): void {
        super._clearCache();
        this.canvas.width = 0;
    }

    _getCanvasSize(): ?number {
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        if (this.size) {
            return this.size;
        }
        if (this.scale) {
            return this.scale * dataSize;
        }
        return dataSize;
    }

    draw(canvas: ?HTMLCanvasElement = null): null | HTMLCanvasElement | Promise {
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }

        const data: ?QRCodeDataType = this.getData();
        if (!data) {
            return null;
        }

        const fgColor = ColorUtils.convertHexColorToBytes(this.fgColor);
        const bgColor = ColorUtils.convertHexColorToBytes(this.bgColor);

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

        this.canvas.width = dataSize;
        this.canvas.height = dataSize;
        this.canvasContext.putImageData(imageData, 0, 0);

        const canvasSize = this._getCanvasSize();

        const qrCodeCanvas = canvas || document.createElement('canvas');
        qrCodeCanvas.width = canvasSize;
        qrCodeCanvas.height = canvasSize;

        const qrCodeCanvasContext = qrCodeCanvas.getContext('2d');
        qrCodeCanvasContext.imageSmoothingEnabled = false;
        qrCodeCanvasContext.drawImage(this.canvas, 0, 0, canvasSize, canvasSize);

        const drawImageResult = this._drawImage(qrCodeCanvasContext, canvasSize / dataSize);
        if (drawImageResult instanceof Promise) {
            return drawImageResult.then(() => {
                return qrCodeCanvas;
            });
        }
        return qrCodeCanvas;
    }

    _getImageSource(imageConfig: ImageConfigType): null | Image | HTMLCanvasElement | Promise {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return ImageLoader.load(source).then((image: Image) => {
                this.image.source = image;
                imageConfig.source = image;
                return image;
            });
        }
        if (source instanceof Image) {
            return source;
        }
        if (source instanceof HTMLCanvasElement) {
            return source;
        }
        return null;
    }

    _drawImage(qrCodeCanvasContext: HTMLCanvasElement, pixelSize: number): null | true | Promise {
        const imageConfig: ImageConfigType = this._getImageConfig();
        if (!imageConfig) {
            return null;
        }

        if (imageConfig.source instanceof Promise) {
            return imageConfig.source.then((image: Image) => {
                qrCodeCanvasContext.drawImage(
                    image,
                    imageConfig.x * pixelSize,
                    imageConfig.y * pixelSize,
                    imageConfig.width * pixelSize,
                    imageConfig.height * pixelSize,
                );
            });
        }

        qrCodeCanvasContext.drawImage(
            imageConfig.source,
            imageConfig.x * pixelSize,
            imageConfig.y * pixelSize,
            imageConfig.width * pixelSize,
            imageConfig.height * pixelSize,
        );

        return true;
    }

    getCanvas(): null | HTMLCanvasElement | Promise {
        return this.draw();
    }

    toDataUrl(type: string = 'image/png', encoderOptions: number = 0.92): null | string | Promise {
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
