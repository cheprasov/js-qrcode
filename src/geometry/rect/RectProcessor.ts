/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { RectInf } from './RectInf';
import type { QRCodeDataType } from '../../type/QRCodeDataType';
import type { Nullable } from '../../type/Nullable';
import { RectsMapItemInf } from './RectsMapItemInf';

enum SquareTypeEnum {
    WHITE = 0,
    BLACK = 1,
    PROCESSED = 2,
}

type SquareTypedData = SquareTypeEnum[][];

export default class RectProcessor {

    protected static _convertToSquareTypedData(data: Nullable<QRCodeDataType>): Nullable<SquareTypedData> {
        if (!data) {
            return null;
        }
        // copy boolean[][] to number[][]
        return data.map((row) => {
            return row.map((isBlack) => {
                return isBlack ? SquareTypeEnum.BLACK : SquareTypeEnum.WHITE;
            });
        });
    }

    static getRects(data: Nullable<QRCodeDataType>): Nullable<RectInf[]> {
        const dataInt = this._convertToSquareTypedData(data);
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
                const isBlack = intType === SquareTypeEnum.BLACK;

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

    protected static _processRect(
        dataInt: SquareTypedData,
        begX: number,
        endX: number,
        begY: number,
    ): Nullable<RectInf> {
        const count = dataInt.length - 1;
        let isNewRect = false;
        let isStopped = false;
        let height = 0;

        for (let y = begY; y <= count; y += 1) {

            for (let x = begX; x <= endX; x += 1) {
                const intType = dataInt[y][x];
                if (intType === SquareTypeEnum.WHITE) {
                    isStopped = true;
                    break;
                }
            }

            if (isStopped) {
                break;
            }

            for (let x = begX; x <= endX; x += 1) {
                if (dataInt[y][x] === SquareTypeEnum.BLACK) {
                    isNewRect = true;
                    dataInt[y][x] = SquareTypeEnum.PROCESSED;
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

    static getRelativeRects(data: Nullable<QRCodeDataType>): Nullable<RectInf[]> {
        const rects = this.getRects(data);
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

}
