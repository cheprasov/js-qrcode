/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import ImageLoader from './ImageLoader';

const GlobalImage = globalThis.Image;
let mockImage!: HTMLImageElement;

beforeAll(() => {
    class MockImage extends GlobalImage {
        constructor(width?: number, height?: number) {
            super(width, height);
            mockImage = this;
        }
    }

    globalThis.Image = MockImage as unknown as typeof Image;
});

afterAll(() => {
    globalThis.Image = GlobalImage;
});

describe('ImageLoader', () => {
    describe('load', () => {
        it('should return a promise', () => {
            expect(ImageLoader.load('foo.bar')).toBeInstanceOf(Promise);
        });

        it('should resolve promise onload', (done) => {
            ImageLoader.load('foo.png').then((img) => {
                expect(img).toEqual(mockImage);
                done();
            });
            const onload = mockImage.onload;
            expect(onload).toBeTruthy();
            onload!.call(mockImage, {} as Event);
        });

        it('should reject promise onerror', (done) => {
            ImageLoader.load('foo.png').catch((img) => {
                expect(img).toEqual(mockImage);
                done();
            });
            const onerror = mockImage.onerror;
            expect(onerror).toBeTruthy();
            onerror!.call(mockImage, {} as Event);
        });
    });
});
