// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';

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

export default class QRCodeCanvas extends QRCodeRaw {

    fgColor: string;
    bgColor: string;

    canvas: HTMLCanvasElement;
    canvasContext: CanvasRenderingContext2D;

    qrCodeCanvas: HTMLCanvasElement;

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
        this.qrCodeCanvasContext = this.qrCodeCanvas.getContext('2d');
    }

    _clearCache(): void {
        super._clearCache();
        this.qrCodeDataUrl = null;
        this.qrCodeCanvas.width = this.qrCodeCanvas.width;
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
            return this.scale * (dataSize + this.padding * 2);
        }
        return dataSize + this.padding * 2;
    }

    _convertHexColorToNumbers(hexColor: string): ?string {
        const result: Array<number> = [];
        let hex = hexColor.replace('#', '');
        switch (hex.length) {
            case 3:
                hex += 'F';
                // Fall through
            case 4:
                result.push(...hex.split('').map(h => parseInt(h.repeat(2), 16)));
                break;
            case 6:
                hex += 'FF';
                // Fall through
            case 8:
                result.push(parseInt(hex.substr(0, 2), 16));
                result.push(parseInt(hex.substr(2, 2), 16));
                result.push(parseInt(hex.substr(4, 2), 16));
                result.push(parseInt(hex.substr(6, 2), 16));
                break;
            default:
                return [0, 0, 0, 0];
        }
        return result;
    }

    _draw(): ?boolean {
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }

        const data: ?QRCodeDataType = this.getData();
        if (!data) {
            return null;
        }

        const fgColor = this._convertHexColorToNumbers(this.fgColor);
        const bgColor = this._convertHexColorToNumbers(this.bgColor);

        let index = 0;
        const bytes = new Uint8ClampedArray((dataSize ** 2) * 4);
        data.forEach((row: Array<boolean>) => {
            row.forEach((isBlack: boolean) => {
                if (isBlack) {
                    bytes.set(fgColor, index);
                } else {
                    bytes.set([0, 0, 0, 0], index);
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

        this.qrCodeCanvasContext.fillStyle = `rgba(${bgColor.slice(0, 3).join(',')},${bgColor[3] / 255})`;
        this.qrCodeCanvasContext.fillRect(0, 0, canvasSize, canvasSize);

        const padding = canvasSize / (dataSize + this.padding * 2) * this.padding;

        this.qrCodeCanvasContext.drawImage(
            this.canvas,
            padding,
            padding,
            this.qrCodeCanvas.width - padding * 2,
            this.qrCodeCanvas.height - padding * 2,
        );

        return true;
    }

    toDataUrl(type: string = 'image/png', encoderOptions: number = 0.92): ?string {
        if (!this.qrCodeDataUrl) {
            if (!this._draw()) {
                return null;
            }
            this.qrCodeDataUrl = this.qrCodeCanvas.toDataURL(type, encoderOptions);
        }

        return this.qrCodeDataUrl;
    }

}
