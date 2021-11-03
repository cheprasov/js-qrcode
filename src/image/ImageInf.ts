import { Nullable } from "../type/Nullable";

export interface ImageInf {
    src: string;
    height: number;
    width: number;
    alt: string;
    onload: Nullable<() => void>;
    onerror: Nullable<() => void>;
    /**
     * Retrieves whether the object is fully loaded.
     */
    readonly complete: boolean;
    /**
     * The original height of the image resource before sizing.
     */
    readonly naturalHeight: number;
    /**
     * The original width of the image resource before sizing.
     */
    readonly naturalWidth: number;
}
