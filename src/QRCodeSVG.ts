/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { OptionsInf as ParentOptionsType } from './QRCodeRaw';
import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';

enum TypeInt {
    WHITE = 0,
    BLACK = 1,
    PROCESSED = 2,
}

type DataIntType = TypeInt[][];

interface RectInf {
    x: number,
    y: number,
    id?: string,
    width?: number,
    height?: number,
}

interface RectsMapItemInf {
    count: number,
    rect: RectInf,
    relative: boolean;
    id?: string,
}

export interface OptionsInf extends ParentOptionsType {
    fgColor: string,
    bgColor: string,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
};

export default class QRCodeSVG extends AbstractQRCodeWithImage {

    protected _fgColor: string;
    protected _bgColor: string;
    protected _qrCodeSVG: string | null = null;
    protected _qrCodeDataUrl: string | null = null;

    constructor(value: string, options: Partial<OptionsInf> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this._fgColor = params.fgColor;
        this._bgColor = params.bgColor;
    }

    protected _clearCache(): void {
        super._clearCache();
        this._qrCodeSVG = null;
        this._qrCodeDataUrl = null;
    }

    protected _getDataInt(): DataIntType | null {
        const data = this.getData();
        if (!data) {
            return null;
        }
        // copy boolean[][] to number[][]
        return data.map((row) => {
            return row.map((isBlack) => {
                return isBlack ? TypeInt.BLACK : TypeInt.WHITE;
            });
        });
    }

    protected _getRects(): RectInf[] | null {
        const dataInt = this._getDataInt();
        if (!dataInt) {
            return null;
        }

        const rects: RectInf[] = [];
        const count = dataInt.length - 1;

        for (let y = 0; y <= count; y += 1) {
            let begX = -1;
            for (let x = 0; x <= count; x += 1) {
                const intType = dataInt[y][x];
                const isLast = x === count;
                // will check processed items too
                // const isBlack = intType !== TYPE_INT_WHITE;
                // or will skip processed items
                const isBlack = intType === TypeInt.BLACK;

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

    protected _processRect(dataInt: DataIntType, begX: number, endX: number, begY: number): RectInf | null {
        const count = dataInt.length - 1;
        let isNewRect = false;
        let isStopped = false;
        let height = 0;

        for (let y = begY; y <= count; y += 1) {

            for (let x = begX; x <= endX; x += 1) {
                const intType = dataInt[y][x];
                if (intType === TypeInt.WHITE) {
                    isStopped = true;
                    break;
                }
            }

            if (isStopped) {
                break;
            }

            for (let x = begX; x <= endX; x += 1) {
                if (dataInt[y][x] === TypeInt.BLACK) {
                    isNewRect = true;
                    dataInt[y][x] = TypeInt.PROCESSED;
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

    protected _getRelativeRects(): RectInf[] | null {
        const rects = this._getRects();
        if (!rects) {
            return null;
        }
        const relativeRects: RectInf[] = [];

        const rectsMap: { [key: string]: RectsMapItemInf} = {};
        let seqRectId = 0;

        rects.forEach((rect: RectInf) => {
            const key = `${rect.width}:${rect.height}`;
            if (rectsMap[key]) {
                rectsMap[key].count += 1;
                if (!rectsMap[key].id) {
                    rectsMap[key].id = `i${seqRectId.toString(32)}`;
                    seqRectId += 1;
                }
            } else {
                rectsMap[key] = { count: 1, rect, relative: false };
            }
        });

        rects.forEach((rect: RectInf) => {
            const key = `${rect.width}:${rect.height}`;
            const rectsMapItem: RectsMapItemInf = rectsMap[key];
            if (rectsMapItem.relative) {
                relativeRects.push({
                    id: rectsMapItem.id,
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

    protected _buildSVG(rects: RectInf[]): string {
        const size = this.getDataSize();
        const tags = [
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
            + `shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">`,
        ];

        if (this._bgColor) {
            tags.push(`<rect x="0" y="0" height="${size}" width="${size}" fill="${this._bgColor}"/>`);
        }

        rects.forEach((rect: RectInf) => {
            if (rect.width && rect.height) {
                const rectId = rect.id ? `id="${rect.id}" ` : '';
                tags.push(
                    // eslint-disable-next-line max-len
                    `<rect ${rectId}x="${rect.x}" y="${rect.y}" height="${rect.height}" width="${rect.width}" fill="${this._fgColor}"/>`,
                );
            } else {
                tags.push(
                    `<use xlink:href="#${rect.id}" x="${rect.x}" y="${rect.y}"/>`,
                );
            }
        });

        const imageConfig = this._getImageCompiledConfig();
        if (imageConfig && imageConfig.width && imageConfig.height) {
            tags.push(
                // eslint-disable-next-line max-len
                `<image xlink:href="${imageConfig.source}" x="${imageConfig.x}" y="${imageConfig.y}" width="${imageConfig.width}" height="${imageConfig.height}"/>`,
            );
        }

        tags.push('</svg>');
        return tags.join('');
    }

    toString(): null | string {
        if (!this._qrCodeSVG) {
            const dataSize = this.getDataSize();
            if (!dataSize) {
                return null;
            }

            const rects = this._getRects();
            if (!rects) {
                return null;
            }

            this._qrCodeSVG = this._buildSVG(rects);
        }

        return this._qrCodeSVG;
    }

    toDataUrl(): null | string {
        if (!this._qrCodeDataUrl) {
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
            this._qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
        }

        return this._qrCodeDataUrl;
    }

}
