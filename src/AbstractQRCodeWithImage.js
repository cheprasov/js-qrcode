// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

export type ImageConfigType = {
    source: string | Image | HTMLCanvasElement | Promise,
    width: number | string, // 20 | 20% | auto
    height: number | string, // 20 | 20% | auto
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

    _getImageRect(): ?ImageConfigType {
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
        const border = typeof this.image.border === 'number' ? this.image.border : null;

        this.imageConfig = { source, border, x, y, width, height };
        return this.imageConfig;
    }

}
