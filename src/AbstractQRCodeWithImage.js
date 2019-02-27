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

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType, QRCodeDataType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

export type ImageConfigType = {
    source: string | Image | HTMLCanvasElement | Promise,
    width: number | string, // 20 | 20%
    height: number | string, // 20 | 20%
    x: number | string, // 20 | 20% | center | left 20% | right 20%
    y: number | string, // 20 | 20% | center | top 20% | bottom 20%,
    border: ?number,
};

export type OptionsType = ParentOptionsType & {
    image?: ImageConfigType,
}

const DEFAULT_OPTIONS = {
    image: null,
};

const DEFAULT_IMAGE_BORDER = 1;

export default class AbstractQRCodeWithImage extends QRCodeRaw {

    image: ?ImageConfigType = null;
    imageConfig: ?ImageConfigType = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };
        this.image = params.image;
    }

    _clearCache(): void {
        super._clearCache();
        this.imageConfig = null;
    }

    _getImageSource(imageConfig: ImageConfigType): ?string {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return source;
        }
        if (source instanceof Image) {
            return source.src;
        }
        if (source instanceof HTMLCanvasElement) {
            return source.toDataURL();
        }
        return null;
    }

    _getImageConfig(): ?ImageConfigType {
        if (this.imageConfig) {
            return this.imageConfig;
        }
        if (!this.image || !this.image.source || !this.image.width || !this.image.height) {
            return null;
        }
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        const source = this._getImageSource(this.image);
        if (!source) {
            return null;
        }

        const dataSizeWithoutPadding = dataSize - this.padding * 2;
        const width = DimensionUtils.calculateDimension(this.image.width, dataSizeWithoutPadding);
        const height = DimensionUtils.calculateDimension(this.image.height, dataSizeWithoutPadding);
        const x = DimensionUtils.calculatePosition(this.image.x, width, dataSizeWithoutPadding) + this.padding;
        const y = DimensionUtils.calculatePosition(this.image.y, height, dataSizeWithoutPadding) + this.padding;

        let border = DEFAULT_IMAGE_BORDER;
        if (typeof this.image.border === 'number' || this.image.border === null) {
            border = this.image.border;
        }

        this.imageConfig = { source, border, x, y, width, height };
        return this.imageConfig;
    }

    getData(): ?QRCodeDataType {
        if (this.qrCodeData) {
            return this.qrCodeData;
        }

        const data = super.getData();
        if (!data) {
            return data;
        }

        const imageConfig: ImageConfigType = this._getImageConfig();
        if (imageConfig && imageConfig.width && imageConfig.height) {
            if (typeof imageConfig.border === 'number') {
                const begX = Math.max(imageConfig.x - imageConfig.border, 0);
                const begY = Math.max(imageConfig.y - imageConfig.border, 0);
                const endX = Math.min(begX + imageConfig.width + imageConfig.border * 2, data.length);
                const endY = Math.min(begY + imageConfig.height + imageConfig.border * 2, data.length);
                for (let y = begY; y < endY; y += 1) {
                    for (let x = begX; x < endX; x += 1) {
                        data[y][x] = this.invert ? true : false;
                    }
                }
            }
        }

        return data;
    }

}
