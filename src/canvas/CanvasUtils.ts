import { CanvasInf } from "./CanvasInf";

export const isCanvasDefined = (): boolean => {
    if (typeof HTMLCanvasElement !== 'undefined') {
        return true;
    }

    return false;
}

export const isCanvas = (cvs: any): cvs is CanvasInf => {
    if (isCanvasDefined() && cvs instanceof HTMLCanvasElement) {
        return true;
    }

    // Duck typing
    if (
        cvs
        && typeof cvs === 'object'
        && 'width' in cvs
        && 'height' in cvs
        && 'getContext' in cvs
        && 'toDataURL' in cvs
    ) {
        return true;
    }

    return false;
}