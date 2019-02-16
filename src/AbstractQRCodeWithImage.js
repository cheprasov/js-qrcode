// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

export type ImageType = {
    source: string | Image | HTMLCanvasElement | Promise,
    width: number | string, // 20 | 20% | auto
    height: number | string, // 20 | 20% | auto
    x: number | string, // 20 | 20% | center | left 20% | right 20%
    y: number | string, // 20 | 20% | center | top 20% | bottom 20%,
    border: ?number,
};

export type OptionsType = ParentOptionsType & {
    image?: ImageType,
}

const DEFAULT_OPTIONS = {
    image: null,
};

export default class AbstractQRCodeWithImage extends QRCodeRaw {

    image: ?ImageType = null;
    imageRect: ?ImageType = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };
        this.image = params.image;
    }

    _clearCache(): void {
        super._clearCache();
        this.imageRect = null;
    }

    _getImageSource(source: string | Image | HTMLCanvasElement): ?string {
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

    _getImageRect(): ?ImageType {
        if (this.imageRect) {
            return this.imageRect;
        }
        if (!this.image || !this.image.source || !this.image.width || !this.image.height) {
            return null;
        }
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        const source = this._getImageSource(this.image.source);
        if (!source) {
            return null;
        }

        const dataSizeWithoutPadding = dataSize - this.padding * 2;
        const width = DimensionUtils.calculateDimension(this.image.width, dataSizeWithoutPadding);
        const height = DimensionUtils.calculateDimension(this.image.height, dataSizeWithoutPadding);
        const x = DimensionUtils.calculatePosition(this.image.x, width, dataSizeWithoutPadding) + this.padding;
        const y = DimensionUtils.calculatePosition(this.image.y, height, dataSizeWithoutPadding) + this.padding;
        const border = typeof this.image.border === 'number' ? this.image.border : null;

        this.imageRect = { source, border, x, y, width, height };
        return this.imageRect;
    }

}
