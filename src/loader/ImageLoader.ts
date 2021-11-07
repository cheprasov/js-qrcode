// @flow
/*
 * This file is part of QR code library
 * git: https://github.com/cheprasov/js-qrcode
 *
 * (C) Alexander Cheprasov <acheprasov84@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ImageInf } from "../image/ImageInf";

export default class ImageLoader {

    static load(imageConstructor: new () => ImageInf, url: string): Promise<ImageInf> {
        return new Promise((resolve, reject) => {
            const img = new imageConstructor();
            img.onload = () => resolve(img);
            img.onerror = () => reject(img);
            img.src = url;
        });
    }

}
