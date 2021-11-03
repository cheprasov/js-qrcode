/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractQRCodeWithImage, { ImageConfigInf } from './AbstractQRCodeWithImage';
import { base64Encode } from "./encoder/base64";
import { isImage } from "./image/ImageUtils";
import { isCanvas } from "./canvas/CanvasUtils";
import RectProcessor from './geometry/rect/RectProcessor';

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

export default class QRCodeSVG extends AbstractQRCodeWithImage<string> {

    protected _qrCodeSVG: string | null = null;
    protected _qrCodeDataUrl: string | null = null;

    protected _getImageSource(imageConfig: ImageConfigInf): string | null {
        const source = imageConfig.source;
        if (typeof source === 'string') {
            return source;
        }
        if (isImage(source)) {
            return source.src;
        }
        if (isCanvas(source)) {
            return source.toDataURL();
        }
        return null;
    }

    protected _clearCache(): void {
        super._clearCache();
        this._qrCodeSVG = null;
        this._qrCodeDataUrl = null;
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

            const rects = RectProcessor.getRects(this.getData());
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

            const relativeRects = RectProcessor.getRelativeRects(this.getData());
            if (!relativeRects) {
                return null;
            }

            // svg based on relative rects has min 20% less length
            const svg = this._buildSVG(relativeRects);
            this._qrCodeDataUrl = `data:image/svg+xml;base64,${base64Encode(svg)}`;
        }

        return this._qrCodeDataUrl;
    }

}
