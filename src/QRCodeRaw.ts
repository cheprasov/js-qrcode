/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-ignore
import QRCodeCore from 'qr.js/lib/QRCode';
// @ts-ignore
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';
import { ErrorCorrectionLevelEnum } from "./ErrorCorrectionLevelEnum";

export interface OptionsType {
    level: ErrorCorrectionLevelEnum,
    typeNumber: number,
    padding: number,
    invert: boolean,
    errorsEnabled: boolean,
}

export type QRCodeDataType = boolean[][];

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    level: ErrorCorrectionLevelEnum.LOW,
    padding: 1,
    invert: false,
    typeNumber: 0,
    errorsEnabled: false,
};

export default class QRCodeRaw {

    protected _value: string;
    protected _level: ErrorCorrectionLevelEnum;
    protected _typeNumber: number;
    protected _padding: number;
    protected _areErrorsEnabled: boolean;
    protected _isInvert: boolean;

    protected _qrCodeData: QRCodeDataType | null = null;

    constructor(value: string, options: Partial<OptionsType> = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this._value = value;
        this._level = params.level;
        this._typeNumber = params.typeNumber;
        this._padding = params.padding;
        this._isInvert = params.invert;
        this._areErrorsEnabled = params.errorsEnabled;
    }

    protected _clearCache(): void {
        this._qrCodeData = null;
    }

    protected _getQrCodeData(modules: QRCodeDataType): QRCodeDataType {
        const qrCodeData = [];

        const padding = this._padding;
        const invert = this._isInvert;
        const rowPadding = Array(padding * 2 + modules.length).fill(invert);
        const rowsPadding = Array(padding).fill(rowPadding);
        const columnPadding = Array(padding).fill(invert);

        if (padding) {
            qrCodeData.push(...rowsPadding);
        }
        modules.forEach((row: boolean[]) => {
            const qrCodeRow = [];
            qrCodeRow.push(
                ...columnPadding,
                ...(row.map(isBlack => (invert ? !isBlack : isBlack))),
                ...columnPadding,
            );
            qrCodeData.push(qrCodeRow);
        });
        if (padding) {
            qrCodeData.push(...rowsPadding);
        }

        return qrCodeData;
    }

    setValue(value: string): void {
        this._value = value;
        this._clearCache();
    }

    getValue(): string {
        return this._value;
    }

    getLevel(): ErrorCorrectionLevelEnum {
        return this._level;
    }

    getPadding(): number {
        return this._padding;
    }

    getTypeNumber(): number {
        return this._typeNumber;
    }

    isInvert(): boolean {
        return this._isInvert;
    }

    areErrorsEnabled(): boolean {
        return this._areErrorsEnabled;
    }

    getDataSize(): number {
        const data = this.getData();
        return data ? data.length : 0;
    }

    getData(): QRCodeDataType | null {
        if (!this._qrCodeData) {
            try {
                const qrcode = new QRCodeCore(this._typeNumber, ErrorCorrectLevel[this._level]);
                qrcode.addData(this._value);
                qrcode.make();
                if (!qrcode.modules) {
                    return null;
                }
                this._qrCodeData = this._getQrCodeData(qrcode.modules);
                Object.freeze(this._qrCodeData);
            } catch (error) {
                if (this._areErrorsEnabled) {
                    throw error;
                }
                return null;
            }
        }
        return this._qrCodeData;
    }

}
