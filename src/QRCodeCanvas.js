// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './utils/ColorUtils';

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
        this.qrCodeCanvas.width = this.qrCodeCanvas.width; // reset canvas
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

    _draw(): ?boolean {
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

        return true;
    }

    getCanvas(): HTMLCanvasElement {
        return this.qrCodeCanvas;
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
