// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';

export type OptionsType = ParentOptionsType & {
    fgColor: string,
    bgColor?: string,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
};

const TYPE_INT_WHITE = 0;
const TYPE_INT_BLACK = 1;
const TYPE_INT_PROCESSED = 2;

type DataIntType = Array<Array<TYPE_INT_WHITE | TYPE_INT_BLACK | TYPE_INT_PROCESSED>>

type RectType = {
    x: number,
    y: number,
    width?: number,
    height?: number,
    id?: string,
};

type RectsMapItemType = {
    count: number,
    rect: RectType,
    id?: string,
    relative: boolean;
};

export default class QRCodeSVG extends QRCodeRaw {

    fgColor: string;
    bgColor: string;
    qrCodeSVG: ?string = null;
    qrCodeDataUrl: ?string = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.fgColor = params.fgColor;
        this.bgColor = params.bgColor;
    }

    _clearCache(): void {
        super._clearCache();
        this.qrCodeSVG = null;
        this.qrCodeDataUrl = null;
    }

    _getDataInt(): ?DataIntType {
        const data = this.getData();
        if (!data) {
            return null;
        }
        // copy boolean[][] to number[][]
        return data.map((row) => {
            return row.map((isBlack) => {
                return isBlack ? TYPE_INT_BLACK : TYPE_INT_WHITE;
            });
        });
    }

    _getRects(): ?RectType[] {
        const dataInt = this._getDataInt();
        if (!dataInt) {
            return null;
        }

        const rects: RectType[] = [];
        const count = dataInt.length - 1;

        for (let y = 0; y <= count; y += 1) {
            let begX = -1;
            for (let x = 0; x <= count; x += 1) {
                const intType = dataInt[y][x];
                const isLast = x === count;
                // will check processed items too
                // const isBlack = intType !== TYPE_INT_WHITE;
                // or will skip processed items
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

    _processRect(dataInt: DataIntType, begX: number, endX: number, begY: number): ?RectType {
        const count = dataInt.length - 1;
        let isNewRect = false;
        let isStopped = false;
        let height = 0;

        for (let y = begY; y <= count; y += 1) {

            for (let x = begX; x <= endX; x += 1) {
                const intType = dataInt[y][x];
                if (intType === TYPE_INT_WHITE) {
                    isStopped = true;
                    break;
                }
            }

            if (isStopped) {
                break;
            }

            for (let x = begX; x <= endX; x += 1) {
                if (dataInt[y][x] === TYPE_INT_BLACK) {
                    isNewRect = true;
                    dataInt[y][x] = TYPE_INT_PROCESSED;
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

    _getRelativeRects(): ?RectType[] {
        const rects = this._getRects();
        if (!rects) {
            return null;
        }
        const relativeRects: RectType[] = [];

        const rectsMap: Object<string, RectsMapItemType> = {};
        let seqRectId = 0;

        rects.forEach((rect: RectType) => {
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

        rects.forEach((rect: RectType) => {
            const key = `${rect.width}:${rect.height}`;
            const rectsMapItem: RectsMapItemType = rectsMap[key];
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

    _buildSVG(rects: RectType[]): string {
        const size = this.getDataSize();
        const tags = [
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" '
            + `shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">`,
        ];

        if (this.bgColor) {
            tags.push(`<rect x="0" y="0" height="${size}" width="${size}" fill="${this.bgColor}"/>`);
        }

        rects.forEach((rect: RectType) => {
            if (rect.width && rect.height) {
                const rectId = rect.id ? `id="${rect.id}" ` : '';
                tags.push(
                    `<rect ${rectId}x="${rect.x}" y="${rect.y}" height="${rect.height}" width="${rect.width}" fill="${this.fgColor}"/>`,
                );
            } else {
                tags.push(
                    `<use xlink:href="#${rect.id}" x="${rect.x}" y="${rect.y}"/>`,
                );
            }
        });

        tags.push('</svg>');
        return tags.join('');
    }

    toString(): ?string {
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

    toDataUrl(): ?string {
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
