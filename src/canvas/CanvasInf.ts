import { CanvasRenderingContext2DInf } from "./CanvasRenderingContext2DInf";

export interface CanvasInf {
    height: number;
    width: number;
    getContext: (contextId: '2d', options?: any) => CanvasRenderingContext2DInf | null;
    // toBlob(callback: BlobCallback, type?: string, quality?: any): void;
    /**
     * Returns the content of the current canvas as an image that you can use as a source for another canvas
     * or an HTML element.
     * @param type The standard MIME type for the image format to return.
     * If you do not specify this parameter, the default value is a PNG format image.
     */
    toDataURL(type?: string, quality?: any): string;
}
