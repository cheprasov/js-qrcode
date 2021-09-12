/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeRaw from "./QRCodeRaw";

import type { OptionsInf as ParentOptionsType } from './QRCodeRaw';

export interface OptionsInf extends ParentOptionsType {
    fgColor: string,
    bgColor: string,
}

const DEFAULT_OPTIONS = {
    fgColor: '#000',
    bgColor: '#FFF',
};

export default class AbstractQRCodeWithFgBgColors extends QRCodeRaw {

    protected _fgColor: string;
    protected _bgColor: string;

    constructor(value: string, options: Partial<OptionsInf> = {}) {
        super(value, options);
        const params = { ...DEFAULT_OPTIONS, ...options };

        this._fgColor = params.fgColor;
        this._bgColor = params.bgColor;
    }

    getBgColor(): string {
        return this._bgColor;
    }

    getFgColor(): string {
        return this._fgColor;
    }

}
