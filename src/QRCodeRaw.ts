/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeCore from 'qr.js/lib/QRCode';
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';

export const ERROR_CORRECTION_LEVEL_LOW = 'L' as const; // Allows recovery of up to 7% data loss
export const ERROR_CORRECTION_LEVEL_MEDIUM = 'M' as const; // Allows recovery of up to 15% data loss
export const ERROR_CORRECTION_LEVEL_QUARTILE = 'Q' as const; // Allows recovery of up to 25% data loss
export const ERROR_CORRECTION_LEVEL_HIGH = 'H' as const; // Allows recovery of up to 30% data loss

export type ErrorCorrectionLevelType =
  | typeof ERROR_CORRECTION_LEVEL_LOW
  | typeof ERROR_CORRECTION_LEVEL_MEDIUM
  | typeof ERROR_CORRECTION_LEVEL_QUARTILE
  | typeof ERROR_CORRECTION_LEVEL_HIGH;

export type QRCodeDataType = boolean[][];

export type Options = {
  level: ErrorCorrectionLevelType;
  typeNumber: number;
  padding: number;
  invert: boolean;
  errorsEnabled: boolean;
};

export type OptionsInput = Partial<Options>;

const DEFAULT_CONSTRUCTOR_PARAMS: Options = {
  level: ERROR_CORRECTION_LEVEL_LOW,
  padding: 1,
  invert: false,
  typeNumber: 0,
  errorsEnabled: false,
};

export default class QRCodeRaw {
  value: string;
  level: ErrorCorrectionLevelType;
  typeNumber: number;
  padding: number;
  invert: boolean;
  errorsEnabled: boolean;

  protected qrCodeData: QRCodeDataType | null = null;

  constructor(value: string, options: OptionsInput = {}) {
    const params: Options = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };

    this.value = value;
    this.level = params.level;
    this.typeNumber = params.typeNumber;
    this.padding = params.padding;
    this.invert = params.invert;
    this.errorsEnabled = params.errorsEnabled;
  }

  setValue(value: string): void {
    this.value = value;
    this._clearCache();
  }

  getDataSize(): number {
    const data = this.getData();
    return data ? data.length : 0;
  }

  protected _clearCache(): void {
    this.qrCodeData = null;
  }

  protected _getQrCodeData(modules: QRCodeDataType): QRCodeDataType {
    const qrCodeData: QRCodeDataType = [];

    const padding = this.padding;
    const invert = this.invert;

    const rowPadding: boolean[] = Array(padding * 2 + modules.length).fill(invert);
    const rowsPadding: boolean[][] = Array(padding).fill(rowPadding);
    const columnPadding: boolean[] = Array(padding).fill(invert);

    if (padding) {
      qrCodeData.push(...rowsPadding);
    }

    modules.forEach((row: boolean[]) => {
      const qrCodeRow: boolean[] = [];
      qrCodeRow.push(
        ...columnPadding,
        ...row.map((isBlack) => (invert ? !isBlack : isBlack)),
        ...columnPadding,
      );
      qrCodeData.push(qrCodeRow);
    });

    if (padding) {
      qrCodeData.push(...rowsPadding);
    }

    return qrCodeData;
  }

  getData(): QRCodeDataType | null {
    if (!this.qrCodeData) {
      try {
        // qr.js is not typed; keep it as runtime integration.
        const qrcode: any = new (QRCodeCore as any)(this.typeNumber, (ErrorCorrectLevel as any)[this.level]);
        qrcode.addData(this.value);
        qrcode.make();

        if (!qrcode.modules) {
          return null;
        }

        this.qrCodeData = this._getQrCodeData(qrcode.modules as QRCodeDataType);
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
