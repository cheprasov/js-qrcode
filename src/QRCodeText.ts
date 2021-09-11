/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeRaw from './QRCodeRaw';
import type { OptionsInf as ParentOptionsInf } from './QRCodeRaw';

export interface OptionsInf extends ParentOptionsInf {
    blackSymbol: string,
    whiteSymbol: string,
}

const DEFAULT_OPTIONS = {
    blackSymbol: '▓▓',
    whiteSymbol: '  ',
};

export default class QRCodeText extends QRCodeRaw {

    protected _blackSymbol: string;
    protected _whiteSymbol: string;
    protected _qrCodeText: string | null = null;

    constructor(value: string, options: Partial<OptionsInf> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this._blackSymbol = params.blackSymbol;
        this._whiteSymbol = params.whiteSymbol;
    }

    protected _clearCache(): void {
        super._clearCache();
        this._qrCodeText = null;
    }

    getBlackSymbol(): string {
        return this._blackSymbol;
    }

    getWhiteSymbol(): string {
        return this._whiteSymbol;
    }

    toString(): null | string {
        if (this._qrCodeText) {
            return this._qrCodeText;
        }

        const dataSize = this.getDataSize();
        if (!dataSize) {
            return null;
        }

        const data = this.getData();
        if (!data) {
            return null;
        }
        const symbols = [];

        for (let y = 0; y < dataSize; y += 1) {
            for (let x = 0; x < dataSize; x += 1) {
                const isBlack = data[y][x];
                symbols.push(isBlack ? this._blackSymbol : this._whiteSymbol);
            }
            symbols.push('\n');
        }
        this._qrCodeText = symbols.join('');
        return this._qrCodeText;
    }

}
