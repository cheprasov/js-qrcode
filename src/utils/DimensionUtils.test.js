/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import DimensionUtils from './DimensionUtils';

describe('DimensionUtils', () => {

    describe('calculateDimension', () => {
        it('should return value if value is number', () => {
            expect(DimensionUtils.calculateDimension(100, 400)).toEqual(100);
            expect(DimensionUtils.calculateDimension(10, 40)).toEqual(10);
            expect(DimensionUtils.calculateDimension(0, 40)).toEqual(0);
            expect(DimensionUtils.calculateDimension(42, 100)).toEqual(42);
        });

        it('should return calculated dimension if value is percentage', () => {
            expect(DimensionUtils.calculateDimension('100%', 400)).toEqual(400);
            expect(DimensionUtils.calculateDimension('75%', 400)).toEqual(300);
            expect(DimensionUtils.calculateDimension('50%', 400)).toEqual(200);
            expect(DimensionUtils.calculateDimension('25%', 400)).toEqual(100);
            expect(DimensionUtils.calculateDimension('10%', 40)).toEqual(4);
            expect(DimensionUtils.calculateDimension('0%', 40)).toEqual(0);
            expect(DimensionUtils.calculateDimension('42%', 100)).toEqual(42);
        });

        it('should parseFloat for other values', () => {
            expect(DimensionUtils.calculateDimension('10', 42)).toEqual(10);
            expect(DimensionUtils.calculateDimension('10a', 42)).toEqual(10);
            expect(DimensionUtils.calculateDimension('10.0', 42)).toEqual(10);
            expect(DimensionUtils.calculateDimension(true, 42)).toEqual(0);
            expect(DimensionUtils.calculateDimension(null, 42)).toEqual(0);
            expect(DimensionUtils.calculateDimension(undefined, 42)).toEqual(0);
        });
    });

    describe('calculatePosition', () => {
        it('should return value if value is number', () => {
            expect(DimensionUtils.calculatePosition(100, 200, 400)).toEqual(100);
            expect(DimensionUtils.calculatePosition(10, 20, 40)).toEqual(10);
            expect(DimensionUtils.calculatePosition(0, 10, 40)).toEqual(0);
            expect(DimensionUtils.calculatePosition(42, 50, 100)).toEqual(42);
        });

        it('should return 0 if value is not number or string', () => {
            expect(DimensionUtils.calculatePosition(true, 200, 400)).toEqual(0);
            expect(DimensionUtils.calculatePosition(null, 20, 40)).toEqual(0);
            expect(DimensionUtils.calculatePosition(false, 10, 40)).toEqual(0);
            expect(DimensionUtils.calculatePosition(undefined, 50, 100)).toEqual(0);
        });

        it('should return 0 if value is top or left', () => {
            expect(DimensionUtils.calculatePosition('left', 200, 400)).toEqual(0);
            expect(DimensionUtils.calculatePosition('top', 20, 40)).toEqual(0);
        });

        it('should return calculate position for right or bottom', () => {
            expect(DimensionUtils.calculatePosition('right', 200, 400)).toEqual(200);
            expect(DimensionUtils.calculatePosition('right', 10, 40)).toEqual(30);
            expect(DimensionUtils.calculatePosition('bottom', 50, 50)).toEqual(0);
            expect(DimensionUtils.calculatePosition('bottom', 10, 40)).toEqual(30);
        });

        it('should return calculate position for center', () => {
            expect(DimensionUtils.calculatePosition('center', 200, 400)).toEqual(100);
            expect(DimensionUtils.calculatePosition('center', 10, 40)).toEqual(15);
            expect(DimensionUtils.calculatePosition('center', 50, 50)).toEqual(0);
            expect(DimensionUtils.calculatePosition('center', 12, 42)).toEqual(15);
        });

        it('should return calculate position if value is percentage', () => {
            expect(DimensionUtils.calculatePosition('10%', 200, 400)).toEqual(40);
            expect(DimensionUtils.calculatePosition('20%', 200, 400)).toEqual(80);
            expect(DimensionUtils.calculatePosition('50%', 200, 400)).toEqual(200);
            expect(DimensionUtils.calculatePosition('100%', 200, 400)).toEqual(400);
            expect(DimensionUtils.calculatePosition('25%', 10, 40)).toEqual(10);
            expect(DimensionUtils.calculatePosition('0%', 10, 40)).toEqual(0);
        });

        it('should return calculate position if side is provided', () => {
            expect(DimensionUtils.calculatePosition('left 10', 200, 400)).toEqual(10);
            expect(DimensionUtils.calculatePosition('right 10', 200, 400)).toEqual(190);
            expect(DimensionUtils.calculatePosition('left 10%', 200, 400)).toEqual(40);
            expect(DimensionUtils.calculatePosition('right 10%', 200, 400)).toEqual(160);
            expect(DimensionUtils.calculatePosition('left 50%', 200, 400)).toEqual(200);
            expect(DimensionUtils.calculatePosition('right 50%', 200, 400)).toEqual(0);
            expect(DimensionUtils.calculatePosition('left 55', 10, 100)).toEqual(55);
            expect(DimensionUtils.calculatePosition('right 55', 10, 100)).toEqual(35);
        });
    });

});
