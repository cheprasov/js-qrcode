import { ImageInf } from "./ImageInf";
import { Image } from "canvas";

export const isImageDefined = (): boolean => {
    if (typeof Image !== 'undefined') {
        return true;
    }

    return false;
}

export const isImage = (img: any): img is ImageInf => {
    if (isImageDefined() && img instanceof Image) {
        return true;
    }

    // Duck typing
    if (
        img
        && typeof img === 'object'
        && 'src' in img
        && 'width' in img
        && 'height' in img
        && 'naturalHeight' in img
        && 'naturalWidth' in img
        && 'complete' in img
        && 'onload' in img
    ) {
        return true;
    }

    return false;
}