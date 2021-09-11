/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeRaw from './QRCodeRaw';
import DimensionUtils from './dimension/DimensionUtils';
import { isImage, isImageDefined } from "./image/ImageUtils";
import { isCanvas, isCanvasDefined } from "./canvas/CanvasUtils";

import type { OptionsInf as ParentOptionsInf, QRCodeDataType } from './QRCodeRaw';
import type { ImageInf } from "./image/ImageInf";
import type { CanvasInf } from "./canvas/CanvasInf";
import type { Nullable } from "./type/Nullable";
import { ImageConstructorInf } from "./image/ImageConstructorInf";
import { CanvasConstructorInf } from "./canvas/CanvasConstructorInf";
import { Image } from "canvas";

export interface ImageConfigInf {
    source: string | ImageInf | CanvasInf,
    width: number | string, // 20 | 20%
    height: number | string, // 20 | 20%
    x: number | string, // 20 | 20% | center | left 20% | right 20%
    y: number | string, // 20 | 20% | center | top 20% | bottom 20%,
    border: number | null,
}

export interface ImageCompiledConfigInf {
    source: string,
    width: number,
    height: number,
    x: number,
    y: number,
    border: number | null,
}

export interface OptionsInf extends ParentOptionsInf {
    image?: ImageConfigInf;
    imageConstructor?: ImageConstructorInf;
    canvasConstructor?: CanvasConstructorInf;
}

const DEFAULT_OPTIONS = {
    image: null,
    imageConstructor: isImageDefined() ? function (...args: any[]) {
        // @ts-ignore
        return new Image(...args);
    } as unknown as ImageConstructorInf : null,
    canvasConstructor: isCanvasDefined() && (typeof document !== 'undefined') ? function () {
        return document.createElement('canvas');
    } as unknown as CanvasConstructorInf  : null,
};

const DEFAULT_IMAGE_BORDER = 1;

export default class AbstractQRCodeWithImage extends QRCodeRaw {

    protected _imageConfig: Nullable<ImageConfigInf>;
    protected _imageConstructor: Nullable<ImageConstructorInf>;
    protected _canvasConstructor: Nullable<CanvasConstructorInf>;

    protected _imageCompiledConfig: Nullable<ImageCompiledConfigInf> = null;

    constructor(value: string, options: Partial<OptionsInf> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this._imageConfig = params.image;
        this._imageConstructor = params.imageConstructor;
        this._canvasConstructor = params.canvasConstructor;
    }

    protected _clearCache(): void {
        super._clearCache();
        this._imageCompiledConfig = null;
    }

    protected _getImageSource(imageConfig: ImageConfigInf): string | null {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return source;
        }
        if (isImage(source)) {
            return source.src;
        }
        if (isCanvas(source)) {
            return source.toDataURL();
        }
        return null;
    }

    protected _getImageCompiledConfig(): ImageCompiledConfigInf | null {
        if (this._imageCompiledConfig) {
            return this._imageCompiledConfig;
        }
        if (!this._imageConfig || !this._imageConfig.source || !this._imageConfig.width || !this._imageConfig.height) {
            return null;
        }
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        const source = this._getImageSource(this._imageConfig);
        if (!source) {
            return null;
        }

        const dataSizeWithoutPadding = dataSize - this._padding * 2;
        const width = DimensionUtils.calculateDimension(this._imageConfig.width, dataSizeWithoutPadding);
        const height = DimensionUtils.calculateDimension(this._imageConfig.height, dataSizeWithoutPadding);
        const x = DimensionUtils.calculatePosition(this._imageConfig.x, width, dataSizeWithoutPadding) + this._padding;
        const y = DimensionUtils.calculatePosition(this._imageConfig.y, height, dataSizeWithoutPadding) + this._padding;

        let border: number | null = DEFAULT_IMAGE_BORDER;
        if (typeof this._imageConfig.border === 'number' || this._imageConfig.border === null) {
            border = this._imageConfig.border;
        }

        this._imageCompiledConfig = { source, border, x, y, width, height };
        return this._imageCompiledConfig;
    }

    getData(): QRCodeDataType | null {
        if (this._qrCodeData) {
            return this._qrCodeData;
        }

        const data = super.getData();
        if (!data) {
            return data;
        }

        const imageConfig = this._getImageCompiledConfig();
        if (imageConfig && imageConfig.width && imageConfig.height) {
            if (typeof imageConfig.border === 'number') {
                const begX = Math.max(imageConfig.x - imageConfig.border, 0);
                const begY = Math.max(imageConfig.y - imageConfig.border, 0);
                const endX = Math.min(begX + imageConfig.width + imageConfig.border * 2, data.length);
                const endY = Math.min(begY + imageConfig.height + imageConfig.border * 2, data.length);
                for (let y = begY; y < endY; y += 1) {
                    for (let x = begX; x < endX; x += 1) {
                        data[y][x] = this._isInvert ? true : false;
                    }
                }
            }
        }

        return data;
    }

}
