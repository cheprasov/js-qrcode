// @flow

import QRCodeRaw from './QRCodeRaw';
import type { OptionsType as ParentOptionsType } from './QRCodeRaw';

export type OptionsType = ParentOptionsType & {
    blackSymbol: string,
    whiteSymbol: string,
}

const DEFAULT_OPTIONS = {
    blackSymbol: '▓▓',
    whiteSymbol: '  ',
};

export default class QRCodeText extends QRCodeRaw {

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

    toString(): null | string {
        if (this.qrCodeText) {
            return this.qrCodeText;
        }

        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }

        const data = this.getData();
        const symbols = [];

        for (let y = 0; y < dataSize; y += 1) {
            for (let x = 0; x < dataSize; x += 1) {
                const isBlack = data[y][x];
                symbols.push(isBlack ? this.blackSymbol : this.whiteSymbol);
            }
            symbols.push('\n');
        }
        this.qrCodeText = symbols.join('');
        return this.qrCodeText;
    }

}
