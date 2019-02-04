// @flow

import QRCodeImpl from 'qr.js/lib/QRCode';
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';

const ERROR_CORRECTION_LEVEL_LOW = 'L'; // Allows recovery of up to 7% data loss
const ERROR_CORRECTION_LEVEL_MEDIUM = 'M'; // Allows recovery of up to 15% data loss
const ERROR_CORRECTION_LEVEL_QUARTILE = 'Q'; // Allows recovery of up to 25% data loss
const ERROR_CORRECTION_LEVEL_HIGH = 'H'; // Allows recovery of up to 30% data loss

export type ErrorCorrectionLevelType = ERROR_CORRECTION_LEVEL_LOW | ERROR_CORRECTION_LEVEL_MEDIUM
    | ERROR_CORRECTION_LEVEL_QUARTILE | ERROR_CORRECTION_LEVEL_HIGH;

export type OptionsType = {
    level: ErrorCorrectionLevelType,
    typeNumber: number,
    padding: number,
};

export type QRCodeDataType = Array<Array<boolean>>;

const DEFAULT_CONSTRUCTOR_PARAMS: OptionsType = {
    level: ERROR_CORRECTION_LEVEL_LOW,
    padding: 1,
    typeNumber: 0,
    errorsEnabled: false,
};

export default class QRCodeRaw {

    value: string;
    level: ErrorCorrectionLevelType;
    typeNumber: number;
    padding: number;
    errorsEnabled: boolean;

    qrCodeData: ?QRCodeDataType;

    constructor(value: string, options: OptionsType = {}) {
        const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

        this.value = value;
        this.level = params.level;
        this.typeNumber = params.typeNumber;
        this.padding = params.padding;
        this.errorsEnabled = params.errorsEnabled;
    }

    setValue(value: string) {
        this.value = value;
        this._clearCache();
    }

    getDataSize(): number {
        const data = this.getData();
        return data ? data.length : 0;
    }

    _clearCache(): void {
        this.qrCodeData = null;
    }

    getData(): ?QRCodeDataType {
        if (!this.qrCodeData) {
            try {
                const qrcode = new QRCodeImpl(this.typeNumber, ErrorCorrectLevel[this.level]);
                qrcode.addData(this.value);
                qrcode.make();
                this.qrCodeData = qrcode.modules;
                Object.freeze(this.qrCodeData);
            } catch (error) {
                if (this.errorsEnabled) {
                    throw error;
                }
                return null;
            }
        }
        return this.qrCodeData;
    }

}
