// @flow

import AbstractQRCode from './AbstractQRCode';
import type { OptionsType as ParentOptionsType } from './AbstractQRCode';

export type OptionsType = ParentOptionsType & {
    blackSymbol: string,
    whiteSymbol: string,
}

const DEFAULT_OPTIONS = {
    blackSymbol: '  ',
    whiteSymbol: '▓▓',
};

export default class QRCodeTerminal extends AbstractQRCode {

    blackSymbol: string;
    whiteSymbol: string;
    qrCodeText: ?string = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.blackSymbol = params.blackSymbol;
        this.whiteSymbol = params.whiteSymbol;
    }

    _getRowPadding(size: number, padding: number): string {
        if (padding) {
            return `${this.whiteSymbol.repeat(padding * 2 + size)}\n`.repeat(padding);
        }
        return '';
    }

    toText(): ?string {
        if (this.qrCodeText) {
            return this.qrCodeText;
        }

        const size = this.getSize();
        if (size === 0) {
            return null;
        }

        const data = this.getData();
        const symbols = [];

        const rowPadding = this._getRowPadding(size, this.padding);
        const columnPadding = this.whiteSymbol.repeat(this.padding);

        if (rowPadding) {
            symbols.push(rowPadding);
        }

        for (let y = 0; y < size; y += 1) {
            if (columnPadding) {
                symbols.push(columnPadding);
            }
            for (let x = 0; x < size; x += 1) {
                const isBlack = data[y][x];
                symbols.push(isBlack ? this.blackSymbol : this.whiteSymbol);
            }
            if (columnPadding) {
                symbols.push(columnPadding);
            }
            symbols.push('\n');
        }

        if (rowPadding) {
            symbols.push(rowPadding);
        }

        this.qrCodeText = symbols.join('');

        return this.qrCodeText;
    }

}
