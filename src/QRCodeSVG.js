// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';
import DimensionUtils from './utils/DimensionUtils';

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

type ImageType = {
    url: string,
    width: number|string, // 20 | 20% | auto
    height: number|string, // 20 | 20% | auto
    x: number|string, // 20 | 20% | center | left 20% | right 20%
    y: number|string, // 20 | 20% | center | top 20% | bottom 20%,
    border: number,
};

export type OptionsType = ParentOptionsType & {
    fgColor: string,
    bgColor?: string,
    image?: ImageType,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
    image: null,
};

export default class QRCodeSVG extends QRCodeRaw {

    fgColor: string;
    bgColor: string;
    qrCodeSVG: ?string = null;
    qrCodeDataUrl: ?string = null;
    imageRect: ?ImageType;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.fgColor = params.fgColor;
        this.bgColor = params.bgColor;
        this.image = params.image;
    }

    _clearCache(): void {
        super._clearCache();
        this.qrCodeSVG = null;
        this.qrCodeDataUrl = null;
        this.imageRect = null;
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

    _getImageRect(): ?ImageType {
        if (this.imageRect) {
            return this.imageRect;
        }
        if (!this.image || !this.image.url || !this.image.width || !this.image.height) {
            return null;
        }
        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }
        const dataSizeWithoutPadding = dataSize - this.padding * 2;
        const width = DimensionUtils.calculateDimension(this.image.width, dataSizeWithoutPadding);
        const height = DimensionUtils.calculateDimension(this.image.height, dataSizeWithoutPadding);
        const x = DimensionUtils.calculatePosition(this.image.x, width, dataSizeWithoutPadding) + this.padding;
        const y = DimensionUtils.calculatePosition(this.image.y, height, dataSizeWithoutPadding) + this.padding;
        this.imageRect = { x, y, width, height, url: this.image.url };
        return this.imageRect;
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

        const imageRect:ImageType = this._getImageRect();
        if (imageRect && imageRect.width && imageRect.height) {
            if (this.bgColor && this.image.border) {
                const x = imageRect.x - this.image.border;
                const y = imageRect.y - this.image.border;
                const width = imageRect.width + this.image.border * 2;
                const height = imageRect.height + this.image.border * 2;
                tags.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${this.bgColor}"/>`);
            }
            //tags.push(`<rect x="${imageRect.x}" y="${imageRect.y}" height="${imageRect.height}" width="${imageRect.width}" fill="red"/>`);
            tags.push(`<image xlink:href="${imageRect.url}" x="${imageRect.x}" y="${imageRect.y}" width="${imageRect.width}" height="${imageRect.height}"/>`);
        }

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
