/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { OptionsInput as ParentOptionsInput, QRCodeDataType } from './QRCodeRaw';
import ColorUtils from './utils/ColorUtils';
import type { ImageConfig } from './AbstractQRCodeWithImage';
import AbstractQRCodeWithImage, { type ImageSource } from './AbstractQRCodeWithImage';
import ImageLoader from './loader/ImageLoader';

export type OptionsInput = ParentOptionsInput & {
  fgColor?: string;
  bgColor?: string | null;
  scale?: number;
  size?: number | null;
};

const DEFAULT_OPTIONS: Required<Pick<OptionsInput, 'fgColor' | 'bgColor' | 'scale' | 'size'>> = {
  fgColor: '#000',
  bgColor: '#FFF',
  scale: 10,
  size: null,
};

export default class QRCodeCanvas extends AbstractQRCodeWithImage {
  fgColor: string;
  bgColor: string | null;
  scale: number;
  size: number | null;

  protected canvas: HTMLCanvasElement;
  protected canvasContext: CanvasRenderingContext2D;

  constructor(value: string, options: OptionsInput = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS, ...options };

    this.fgColor = params.fgColor;
    this.bgColor = params.bgColor;
    this.scale = params.scale;
    this.size = params.size;

    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Cannot acquire 2d canvas context');
    }
    this.canvasContext = ctx;

    // Back-compat alias used by older consumers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).toDataURL = this.toDataUrl.bind(this);
  }

  protected _clearCache(): void {
    super._clearCache();
    this.canvas.width = 0;
  }

  protected _getCanvasSize(): number | null {
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

  draw(canvas: HTMLCanvasElement | null = null): HTMLCanvasElement | Promise<HTMLCanvasElement> | null {
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }

    const data: QRCodeDataType | null = this.getData();
    if (!data) {
      return null;
    }

    const fgColor = ColorUtils.convertHexColorToBytes(this.fgColor);
    const bgColor = ColorUtils.convertHexColorToBytes(this.bgColor ?? '#FFF');

    let index = 0;
    const bytes = new Uint8ClampedArray(dataSize ** 2 * 4);
    data.forEach((row: boolean[]) => {
      row.forEach((isBlack: boolean) => {
        bytes.set(isBlack ? fgColor : bgColor, index);
        index += 4;
      });
    });

    const imageData = new ImageData(bytes, dataSize, dataSize);

    this.canvas.width = dataSize;
    this.canvas.height = dataSize;
    this.canvasContext.putImageData(imageData, 0, 0);

    const canvasSize = this._getCanvasSize();
    if (!canvasSize) {
      return null;
    }

    const qrCodeCanvas = canvas ?? document.createElement('canvas');
    qrCodeCanvas.width = canvasSize;
    qrCodeCanvas.height = canvasSize;

    const qrCodeCanvasContext = qrCodeCanvas.getContext('2d');
    if (!qrCodeCanvasContext) {
      throw new Error('Cannot acquire 2d canvas context');
    }

    qrCodeCanvasContext.imageSmoothingEnabled = false;
    qrCodeCanvasContext.drawImage(this.canvas, 0, 0, canvasSize, canvasSize);

    const drawImageResult = this._drawImage(qrCodeCanvasContext, canvasSize / dataSize);
    if (drawImageResult instanceof Promise) {
      return drawImageResult.then(() => qrCodeCanvas);
    }
    return qrCodeCanvas;
  }

  protected _getImageSource(imageConfig: ImageConfig): ImageSource | null {
    const source = imageConfig.source;
    if (typeof source === 'string') {
      return ImageLoader.load(source).then((image) => {
        if (this.image) {
          this.image.source = image;
        }
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

  protected _drawImage(
    qrCodeCanvasContext: CanvasRenderingContext2D,
    pixelSize: number,
  ): true | Promise<void> | null {
    const imageConfig = this._getImageConfig();
    if (!imageConfig) {
      return null;
    }

    if (imageConfig.source instanceof Promise) {
      return imageConfig.source.then((image) => {
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
      imageConfig.source as any,
      imageConfig.x * pixelSize,
      imageConfig.y * pixelSize,
      imageConfig.width * pixelSize,
      imageConfig.height * pixelSize,
    );

    return true;
  }

  getCanvas(): HTMLCanvasElement | Promise<HTMLCanvasElement> | null {
    return this.draw();
  }

  toDataUrl(type: string = 'image/png', encoderOptions: number = 0.92): string | Promise<string> | null {
    const canvasOrPromise = this.draw();
    if (!canvasOrPromise) {
      return null;
    }
    if (canvasOrPromise instanceof Promise) {
      return canvasOrPromise.then((qrCodeCanvas) => qrCodeCanvas.toDataURL(type, encoderOptions));
    }
    return canvasOrPromise.toDataURL(type, encoderOptions);
  }
}
