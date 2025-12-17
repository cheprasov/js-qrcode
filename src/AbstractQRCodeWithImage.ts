/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeRaw, { type OptionsInput as ParentOptionsInput, type QRCodeDataType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

export type ImageSource = string | HTMLImageElement | HTMLCanvasElement | Promise<HTMLImageElement>;

export type ImageConfig = {
  source: ImageSource;
  width: number | string; // 20 | 20%
  height: number | string; // 20 | 20%
  x: number | string; // 20 | 20% | center | left 20% | right 20%
  y: number | string; // 20 | 20% | center | top 20% | bottom 20%
  border?: number | null;
};

export type NormalizedImageConfig = {
  source: ImageSource;
  width: number;
  height: number;
  x: number;
  y: number;
  border: number | null;
};

export type OptionsInput = ParentOptionsInput & {
  image?: ImageConfig | null;
};

const DEFAULT_OPTIONS: OptionsInput = {
  image: null,
};

const DEFAULT_IMAGE_BORDER = 1;

export default class AbstractQRCodeWithImage extends QRCodeRaw {
  image: ImageConfig | null = null;
  protected imageConfig: NormalizedImageConfig | null = null;

  constructor(value: string, options: OptionsInput = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS, ...options };
    this.image = params.image ?? null;
  }

  protected _clearCache(): void {
    super._clearCache();
    this.imageConfig = null;
  }

  protected _getImageSource(imageConfig: ImageConfig): ImageSource | null {
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
    if (source instanceof Promise) {
      return source;
    }
    return null;
  }

  protected _getImageConfig(): NormalizedImageConfig | null {
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

    let border: number | null = DEFAULT_IMAGE_BORDER;
    if (typeof this.image.border === 'number' || this.image.border === null) {
      border = this.image.border;
    }

    this.imageConfig = { source, border, x, y, width, height };
    return this.imageConfig;
  }

  getData(): QRCodeDataType | null {
    if (this.qrCodeData) {
      return this.qrCodeData;
    }

    const data = super.getData();
    if (!data) {
      return data;
    }

    const imageConfig = this._getImageConfig();
    if (imageConfig && imageConfig.width && imageConfig.height) {
      if (typeof imageConfig.border === 'number') {
        const begX = Math.max(imageConfig.x - imageConfig.border, 0);
        const begY = Math.max(imageConfig.y - imageConfig.border, 0);
        const endX = Math.min(begX + imageConfig.width + imageConfig.border * 2, data.length);
        const endY = Math.min(begY + imageConfig.height + imageConfig.border * 2, data.length);
        for (let y = begY; y < endY; y += 1) {
          for (let x = begX; x < endX; x += 1) {
            data[y]![x] = this.invert ? true : false;
          }
        }
      }
    }

    return data;
  }
}
