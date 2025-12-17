/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { OptionsInput as ParentOptionsInput } from './QRCodeRaw';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';

const TYPE_INT_WHITE = 0 as const;
const TYPE_INT_BLACK = 1 as const;
const TYPE_INT_PROCESSED = 2 as const;

type CellInt = typeof TYPE_INT_WHITE | typeof TYPE_INT_BLACK | typeof TYPE_INT_PROCESSED;
type DataInt = CellInt[][];

type Rect = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  id?: string;
};

type RectsMapItem = {
  count: number;
  rect: Rect;
  id?: string | null;
  relative: boolean;
};

export type OptionsInput = ParentOptionsInput & {
  fgColor?: string;
  bgColor?: string;
};

const DEFAULT_OPTIONS: Required<Pick<OptionsInput, 'fgColor' | 'bgColor'>> = {
  fgColor: '#000',
  bgColor: '#FFF',
};

export default class QRCodeSVG extends AbstractQRCodeWithImage {
  fgColor: string;
  bgColor: string;

  protected qrCodeSVG: string | null = null;
  protected qrCodeDataUrl: string | null = null;

  constructor(value: string, options: OptionsInput = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS, ...options };

    this.fgColor = params.fgColor;
    this.bgColor = params.bgColor;

    // Back-compat alias used by older consumers.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).toDataURL = this.toDataUrl.bind(this);
  }

  protected _clearCache(): void {
    super._clearCache();
    this.qrCodeSVG = null;
    this.qrCodeDataUrl = null;
  }

  protected _getDataInt(): DataInt | null {
    const data = this.getData();
    if (!data) {
      return null;
    }
    // copy boolean[][] to number[][]
    return data.map((row) => row.map((isBlack) => (isBlack ? TYPE_INT_BLACK : TYPE_INT_WHITE)));
  }

  protected _getRects(): Rect[] | null {
    const dataInt = this._getDataInt();
    if (!dataInt) {
      return null;
    }

    const rects: Rect[] = [];
    const count = dataInt.length - 1;

    for (let y = 0; y <= count; y += 1) {
      let begX = -1;
      for (let x = 0; x <= count; x += 1) {
        const intType = dataInt[y]![x]!;
        const isLast = x === count;
        // skip processed items
        const isBlack = intType === TYPE_INT_BLACK;

        if (isBlack && begX === -1) {
          begX = x;
        }

        if (begX !== -1 && (isLast || !isBlack)) {
          const endX = x - (isBlack ? 0 : 1);
          const rect = this._processRect(dataInt, begX, endX, y);
          if (rect) {
            rects.push(rect);
          }
          begX = -1;
        }
      }
    }

    return rects;
  }

  protected _processRect(dataInt: DataInt, begX: number, endX: number, begY: number): Rect | null {
    const count = dataInt.length - 1;
    let isNewRect = false;
    let isStopped = false;
    let height = 0;

    for (let y = begY; y <= count; y += 1) {
      for (let x = begX; x <= endX; x += 1) {
        const intType = dataInt[y]![x]!;
        if (intType === TYPE_INT_WHITE) {
          isStopped = true;
          break;
        }
      }

      if (isStopped) {
        break;
      }

      for (let x = begX; x <= endX; x += 1) {
        if (dataInt[y]![x]! === TYPE_INT_BLACK) {
          isNewRect = true;
          dataInt[y]![x]! = TYPE_INT_PROCESSED;
        }
      }

      height += 1;
    }

    if (!isNewRect) {
      return null;
    }

    return {
      x: begX,
      y: begY,
      width: endX - begX + 1,
      height,
    };
  }

  protected _getRelativeRects(): Rect[] | null {
    const rects = this._getRects();
    if (!rects) {
      return null;
    }
    const relativeRects: Rect[] = [];

    const rectsMap: Record<string, RectsMapItem> = {};
    let seqRectId = 0;

    rects.forEach((rect: Rect) => {
      const key = `${rect.width}:${rect.height}`;
      if (rectsMap[key]) {
        rectsMap[key].count += 1;
        if (!rectsMap[key].id) {
          rectsMap[key].id = `i${seqRectId.toString(32)}`;
          seqRectId += 1;
        }
      } else {
        rectsMap[key] = { count: 1, rect, relative: false, id: null };
      }
    });

    rects.forEach((rect: Rect) => {
      const key = `${rect.width}:${rect.height}`;
      const rectsMapItem = rectsMap[key]!;
      if (rectsMapItem.relative) {
        relativeRects.push({
          id: rectsMapItem.id as string,
          x: rect.x - rectsMapItem.rect.x,
          y: rect.y - rectsMapItem.rect.y,
        });
      } else {
        if (rectsMapItem.id) {
          rect.id = rectsMapItem.id;
          rectsMapItem.relative = true;
        }
        relativeRects.push(rect);
      }
    });

    return relativeRects;
  }

  protected _buildSVG(rects: Rect[]): string {
    const size = this.getDataSize();
    const tags = [
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
        + `shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">`,
    ];

    if (this.bgColor) {
      tags.push(`<rect x="0" y="0" height="${size}" width="${size}" fill="${this.bgColor}"/>`);
    }

    rects.forEach((rect: Rect) => {
      if (rect.width && rect.height) {
        const rectId = rect.id ? `id="${rect.id}" ` : '';
        tags.push(
          `<rect ${rectId}x="${rect.x}" y="${rect.y}" height="${rect.height}" width="${rect.width}" fill="${this.fgColor}"/>`,
        );
      } else {
        tags.push(`<use xlink:href="#${rect.id}" x="${rect.x}" y="${rect.y}"/>`);
      }
    });

    const imageConfig = this._getImageConfig();
    if (imageConfig && imageConfig.width && imageConfig.height) {
      tags.push(
        `<image xlink:href="${imageConfig.source}" x="${imageConfig.x}" y="${imageConfig.y}" width="${imageConfig.width}" height="${imageConfig.height}"/>`,
      );
    }

    tags.push('</svg>');
    return tags.join('');
  }

  toString(): string | null {
    if (!this.qrCodeSVG) {
      const dataSize = this.getDataSize();
      if (!dataSize) {
        return null;
      }

      const rects = this._getRects();
      if (!rects) {
        return null;
      }

      this.qrCodeSVG = this._buildSVG(rects);
    }

    return this.qrCodeSVG;
  }

  toDataUrl(): string | null {
    if (!this.qrCodeDataUrl) {
      const dataSize = this.getDataSize();
      if (!dataSize) {
        return null;
      }

      const relativeRects = this._getRelativeRects();
      if (!relativeRects) {
        return null;
      }

      // svg based on relative rects has min 20% less length
      const svg = this._buildSVG(relativeRects);
      this.qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    return this.qrCodeDataUrl;
  }
}
