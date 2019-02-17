import AbstractQRCodeWithImage from './AbstractQRCodeWithImage';

describe('AbstractQRCodeWithImage', () => {

    describe('constructor', () => {
        it('should use default params if nothing is provided', () => {
            const qrCode = new AbstractQRCodeWithImage();
            expect(qrCode.value).toBeUndefined();
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('L');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.image).toBeNull();
        });

        it('should default params for not specified params', () => {
            const qrCode = new AbstractQRCodeWithImage('test 42', { level: 'Q', size: 100 });
            expect(qrCode.value).toEqual('test 42');
            expect(qrCode.padding).toEqual(1);
            expect(qrCode.level).toEqual('Q');
            expect(qrCode.typeNumber).toEqual(0);
            expect(qrCode.errorsEnabled).toBeFalsy();
            expect(qrCode.invert).toBeFalsy();
            expect(qrCode.image).toBeNull();
        });

        it('should use specified params', () => {
            const qrCode = new AbstractQRCodeWithImage(
                'test 84',
                {
                    level: 'H',
                    padding: 0,
                    typeNumber: 20,
                    invert: true,
                    errorsEnabled: true,
                    image: {
                        source: 'some-url.png',
                        width: 100,
                        height: 100,
                    },
                },
            );
            expect(qrCode.value).toEqual('test 84');
            expect(qrCode.padding).toEqual(0);
            expect(qrCode.level).toEqual('H');
            expect(qrCode.typeNumber).toEqual(20);
            expect(qrCode.errorsEnabled).toBeTruthy();
            expect(qrCode.invert).toBeTruthy();
            expect(qrCode.image).toEqual({
                source: 'some-url.png',
                width: 100,
                height: 100,
            });
        });
    });

    describe('_clearCache', () => {
        it('should clear qrCodeData and qrCodeText', () => {
            const qrCode = new AbstractQRCodeWithImage('test');
            qrCode.imageConfig = {
                source: 'some-url.png',
                width: 100,
                height: 100,
            };
            qrCode._clearCache();
            expect(qrCode.imageConfig).toBeNull();
        });
    });

    describe('_getImageSource', () => {
        it('should return string if string is passed', () => {
            const qrCode = new AbstractQRCodeWithImage('test');
            expect(qrCode._getImageSource({ source: 'foo-bar.png' })).toEqual('foo-bar.png');
        });

        it('should return Image.src if Image is passed', () => {
            const qrCode = new AbstractQRCodeWithImage('test');
            const img = new Image();
            img.src = 'https://some-url.com/foo.png';
            expect(qrCode._getImageSource({ source: img })).toEqual('https://some-url.com/foo.png');
        });

        it('should return Canvas.toDataUrl if Canvas is passed', () => {
            const qrCode = new AbstractQRCodeWithImage('test');
            const canvas = document.createElement('canvas');
            canvas.toDataURL = jest.fn(() => 'data:foo-bar');
            expect(qrCode._getImageSource({ source: canvas })).toEqual('data:foo-bar');
            expect(canvas.toDataURL).toHaveBeenCalled();
        });
    });

});
