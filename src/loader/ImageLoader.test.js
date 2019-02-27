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

const GlobalImage = global.Image;
let mockImage;

beforeAll(() => {
    global.Image = function() {
        mockImage = new GlobalImage();
        return mockImage;
    };
});

afterAll(() => {
    global.Image = GlobalImage;
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
            mockImage.onload();
        });

        it('should reject promise onerror', (done) => {
            ImageLoader.load('foo.png').catch((img) => {
                expect(img).toEqual(mockImage);
                done();
            });
            mockImage.onerror();
        });
    });

});
