/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ColorUtils from './ColorUtils';

describe('ColorUtils', () => {

    describe('convertHexColorToBytes', () => {
        it('should return empty bytes if hex color has wrong value', () => {
            expect(ColorUtils.convertHexColorToBytes('A')).toEqual([0, 0, 0, 0]);
            expect(ColorUtils.convertHexColorToBytes('red')).toEqual([0, 0, 0, 0]);
            expect(ColorUtils.convertHexColorToBytes('blue')).toEqual([0, 0, 0, 0]);
            expect(ColorUtils.convertHexColorToBytes('##FFF')).toEqual([0, 0, 0, 0]);
        });

        it('should return bytes for hex color with alpha', () => {
            expect(ColorUtils.convertHexColorToBytes('#FFFFFFFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('#00000000')).toEqual([0, 0, 0, 0]);
            expect(ColorUtils.convertHexColorToBytes('#AABBCCDD')).toEqual([170, 187, 204, 221]);
        });

        it('should return bytes with default alpha for hex color without alpha', () => {
            expect(ColorUtils.convertHexColorToBytes('#FFFFFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('#000000')).toEqual([0, 0, 0, 255]);
            expect(ColorUtils.convertHexColorToBytes('#AABBCC')).toEqual([170, 187, 204, 255]);
        });

        it('should return bytes for short hex color with alpha', () => {
            expect(ColorUtils.convertHexColorToBytes('#FFFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('#0000')).toEqual([0, 0, 0, 0]);
            expect(ColorUtils.convertHexColorToBytes('#ABCD')).toEqual([170, 187, 204, 221]);
        });

        it('should return bytes with default alpha for short hex color without alpha', () => {
            expect(ColorUtils.convertHexColorToBytes('#FFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('#000')).toEqual([0, 0, 0, 255]);
            expect(ColorUtils.convertHexColorToBytes('#ABC')).toEqual([170, 187, 204, 255]);
        });

        it('should allow to use hex color without #', () => {
            expect(ColorUtils.convertHexColorToBytes('FFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('000')).toEqual([0, 0, 0, 255]);
            expect(ColorUtils.convertHexColorToBytes('ABC')).toEqual([170, 187, 204, 255]);

            expect(ColorUtils.convertHexColorToBytes('FFFA')).toEqual([255, 255, 255, 170]);
            expect(ColorUtils.convertHexColorToBytes('000A')).toEqual([0, 0, 0, 170]);
            expect(ColorUtils.convertHexColorToBytes('ABCA')).toEqual([170, 187, 204, 170]);

            expect(ColorUtils.convertHexColorToBytes('FFFFFF')).toEqual([255, 255, 255, 255]);
            expect(ColorUtils.convertHexColorToBytes('0A0A0A')).toEqual([10, 10, 10, 255]);
            expect(ColorUtils.convertHexColorToBytes('0A0B0C')).toEqual([10, 11, 12, 255]);

            expect(ColorUtils.convertHexColorToBytes('FFFFFF0F')).toEqual([255, 255, 255, 15]);
            expect(ColorUtils.convertHexColorToBytes('0000000A')).toEqual([0, 0, 0, 10]);
            expect(ColorUtils.convertHexColorToBytes('42424242')).toEqual([66, 66, 66, 66]);
        });
    });

});
