// @flow

import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './utils/ColorUtils';
import type { ImageType } from './AbstractQRCodeWithImage';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';
import ImageLoader from './loader/ImageLoader';

export type OptionsType = ParentOptionsType & {
    fgColor?: string,
    bgColor?: ?string,
    scale?: number,
    width?: number,
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
    qrCodeCanvas: HTMLCanvasElement;
    qrCodeCanvasContext: CanvasRenderingContext2D;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.fgColor = params.fgColor;
        this.bgColor = params.bgColor;
        this.scale = params.scale;
        this.size = params.size;

        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');

        this.qrCodeCanvas = document.createElement('canvas');
        this.qrCodeCanvas.width = 0;
        this.qrCodeCanvasContext = this.qrCodeCanvas.getContext('2d');
    }

    _clearCache(): void {
        super._clearCache();
        this.qrCodeDataUrl = null;
        this.qrCodeCanvas.width = 0;
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

    _draw(): ?boolean|Promise {
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

        this.qrCodeCanvas.width = canvasSize;
        this.qrCodeCanvas.height = canvasSize;
        this.qrCodeCanvasContext.imageSmoothingEnabled = false;
        this.qrCodeCanvasContext.drawImage(this.canvas, 0, 0, this.qrCodeCanvas.width, this.qrCodeCanvas.height);

        const drawImageResult = this._drawImage(canvasSize / dataSize, bgColor);
        if (drawImageResult instanceof Promise) {
            return drawImageResult;
        }
        return true;
    }

    _getImageSource(source: string | Image | HTMLCanvasElement): null | Image | HTMLCanvasElement | Promise {
        if (typeof source === 'string') {
            return ImageLoader.load(source);
        }
        if (source instanceof Image) {
            return source;
        }
        if (source instanceof HTMLCanvasElement) {
            return source;
        }
        return null;
    }

    _drawImage(pixelSize: number, bgColor: number[]): ?Promise {
        const imageRect: ImageType = this._getImageRect();
        if (!imageRect) {
            return null;
        }
        if (typeof imageRect.border === 'number') {
            const x = (imageRect.x - imageRect.border) * pixelSize;
            const y = (imageRect.y - imageRect.border) * pixelSize;
            const width = (imageRect.width + imageRect.border * 2) * pixelSize;
            const height = (imageRect.height + imageRect.border * 2) * pixelSize;
            this.qrCodeCanvasContext.fillStyle = `rgba(${bgColor.slice(0, 3).join(',')},${bgColor[3] / 255})`;
            this.qrCodeCanvasContext.clearRect(x, y, width, height);
            this.qrCodeCanvasContext.fillRect(x, y, width, height);
        }

        if (imageRect.source instanceof Promise) {
            return imageRect.source.then((image: Image) => {
                this.qrCodeCanvasContext.drawImage(
                    image,
                    imageRect.x * pixelSize,
                    imageRect.y * pixelSize,
                    imageRect.width * pixelSize,
                    imageRect.height * pixelSize,
                );
            });
        }

        this.qrCodeCanvasContext.drawImage(
            imageRect.source,
            imageRect.x * pixelSize,
            imageRect.y * pixelSize,
            imageRect.width * pixelSize,
            imageRect.height * pixelSize,
        );

        return null;
    }

    getCanvas(): HTMLCanvasElement {
        if (!this.qrCodeCanvas.width) {
            const result = this._draw();
            if (!result) {
                return null;
            }
            if (result instanceof Promise) {
                return result.then(() => this.qrCodeCanvas);
            }
        }
        return this.qrCodeCanvas;
    }

    toDataUrl(type: string = 'image/png', encoderOptions: number = 0.92): ?string {
        if (!this.qrCodeDataUrl) {
            const result = this._draw();
            if (!result) {
                return null;
            }
            if (result instanceof Promise) {
                return result.then(() => {
                    this.qrCodeDataUrl = this.qrCodeCanvas.toDataURL(type, encoderOptions);
                    return this.qrCodeDataUrl;
                });
            }
        }
        return this.qrCodeDataUrl;
    }

}
