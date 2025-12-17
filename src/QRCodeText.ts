/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import QRCodeRaw, { type OptionsInput as ParentOptionsInput } from './QRCodeRaw';

export type OptionsInput = ParentOptionsInput & {
  blackSymbol?: string;
  whiteSymbol?: string;
};

const DEFAULT_OPTIONS: Required<Pick<OptionsInput, 'blackSymbol' | 'whiteSymbol'>> = {
  blackSymbol: '▓▓',
  whiteSymbol: '  ',
};

export default class QRCodeText extends QRCodeRaw {
  blackSymbol: string;
  whiteSymbol: string;
  protected qrCodeText: string | null = null;

  constructor(value: string, options: OptionsInput = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS, ...options };

    this.blackSymbol = params.blackSymbol;
    this.whiteSymbol = params.whiteSymbol;
  }

  protected _clearCache(): void {
    super._clearCache();
    this.qrCodeText = null;
  }

  toString(): string | null {
    if (this.qrCodeText) {
      return this.qrCodeText;
    }

    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }

    const data = this.getData();
    if (!data) {
      return null;
    }

    const symbols: string[] = [];

    for (let y = 0; y < dataSize; y += 1) {
      for (let x = 0; x < dataSize; x += 1) {
        const isBlack = data[y]![x]!;
        symbols.push(isBlack ? this.blackSymbol : this.whiteSymbol);
      }
      symbols.push('\n');
    }

    this.qrCodeText = symbols.join('');
    return this.qrCodeText;
  }
}
