// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';

export type OptionsType = ParentOptionsType & {
    blackSymbol: string,
    whiteSymbol: string,
}

const DEFAULT_OPTIONS = {
    blackSymbol: '  ',
    whiteSymbol: '▓▓',
};

export default class QRCodeTerminal extends QRCodeRaw {

    blackSymbol: string;
    whiteSymbol: string;
    qrCodeText: ?string = null;

    constructor(value: string, options: OptionsType = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this.blackSymbol = params.blackSymbol;
        this.whiteSymbol = params.whiteSymbol;
    }

    _clearCache(): void {
        super._clearCache();
        this.qrCodeText = null;
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

        const dataSize = this.getDataSize();
        if (dataSize === 0) {
            return null;
        }

        const data = this.getData();
        const symbols = [];

        const rowPadding = this._getRowPadding(dataSize, this.padding);
        const columnPadding = this.whiteSymbol.repeat(this.padding);

        if (rowPadding) {
            symbols.push(rowPadding);
        }

        for (let y = 0; y < dataSize; y += 1) {
            if (columnPadding) {
                symbols.push(columnPadding);
            }
            for (let x = 0; x < dataSize; x += 1) {
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
