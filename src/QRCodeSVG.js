// @flow

import AbstractQRCode from './AbstractQRCode';
import type { OptionsType as ParentOptionsType } from './AbstractQRCode';

export type OptionsType = ParentOptionsType & {
    fgColor: string,
    bgColor: ?string,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#fff',
};

export default class QRCodeSVG extends AbstractQRCode {

    fgColor: string;
    bgColor: string;
    qrCodeSVG: ?string = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.fgColor = params.fgColor;
        this.bgColor = params.bgColor;
    }

    getAsHTML(): string {
        if (this.qrCodeSVG) {
            return this.qrCodeSVG;
        }
        const size = this.getSize();
        const data = this.getData();
        const canvasSize = size + this.padding * 2;

        const tags = [
            `<svg shapeRendering="crispEdges" viewBox="0 0 ${canvasSize} ${canvasSize}">`,
        ];

        if (this.bgColor) {
            tags.push(
                `<rect height="${canvasSize}" width="${canvasSize}" style="fill: ${this.bgColor}" x="0" y="0" />`,
            );
        }

        for (let y = 0; y < size; y += 1) {
            let width = 0;
            for (let x = 0; x < size; x += 1) {
                const isBlack = data[y][x];
                if (isBlack) {
                    width += 1;
                }
                if (width && (size - 1 === x || !isBlack)) {
                    const px = x + this.padding - width + (isBlack ? 1 : 0);
                    const py = y + this.padding;
                    tags.push(
                        `<rect height="1" width="${width}" style="fill: ${this.fgColor}" x="${px}" y="${py}" />`,
                    );
                    width = 0;
                }
            }
        }

        tags.push('</svg>');
        this.qrCodeSVG = tags.join('');

        return this.qrCodeSVG;
    }

}
