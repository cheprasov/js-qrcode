declare const ERROR_CORRECTION_LEVEL_LOW: "L";
declare const ERROR_CORRECTION_LEVEL_MEDIUM: "M";
declare const ERROR_CORRECTION_LEVEL_QUARTILE: "Q";
declare const ERROR_CORRECTION_LEVEL_HIGH: "H";
type ErrorCorrectionLevelType = typeof ERROR_CORRECTION_LEVEL_LOW | typeof ERROR_CORRECTION_LEVEL_MEDIUM | typeof ERROR_CORRECTION_LEVEL_QUARTILE | typeof ERROR_CORRECTION_LEVEL_HIGH;
type QRCodeDataType = boolean[][];
type Options = {
    level: ErrorCorrectionLevelType;
    typeNumber: number;
    padding: number;
    invert: boolean;
    errorsEnabled: boolean;
};
type OptionsInput$4 = Partial<Options>;
declare class QRCodeRaw {
    value: string;
    level: ErrorCorrectionLevelType;
    typeNumber: number;
    padding: number;
    invert: boolean;
    errorsEnabled: boolean;
    protected qrCodeData: QRCodeDataType | null;
    constructor(value: string, options?: OptionsInput$4);
    setValue(value: string): void;
    getDataSize(): number;
    protected _clearCache(): void;
    protected _getQrCodeData(modules: QRCodeDataType): QRCodeDataType;
    getData(): QRCodeDataType | null;
}

type ImageSource = string | HTMLImageElement | HTMLCanvasElement | Promise<HTMLImageElement>;
type ImageConfig = {
    source: ImageSource;
    width: number | string;
    height: number | string;
    x: number | string;
    y: number | string;
    border?: number | null;
};
type NormalizedImageConfig = {
    source: ImageSource;
    width: number;
    height: number;
    x: number;
    y: number;
    border: number | null;
};
type OptionsInput$3 = OptionsInput$4 & {
    image?: ImageConfig | null;
};
declare class AbstractQRCodeWithImage extends QRCodeRaw {
    image: ImageConfig | null;
    protected imageConfig: NormalizedImageConfig | null;
    constructor(value: string, options?: OptionsInput$3);
    protected _clearCache(): void;
    protected _getImageSource(imageConfig: ImageConfig): ImageSource | null;
    protected _getImageConfig(): NormalizedImageConfig | null;
    getData(): QRCodeDataType | null;
}

type OptionsInput$2 = OptionsInput$4 & {
    fgColor?: string;
    bgColor?: string | null;
    scale?: number;
    size?: number | null;
};
declare class QRCodeCanvas extends AbstractQRCodeWithImage {
    fgColor: string;
    bgColor: string | null;
    scale: number;
    size: number | null;
    protected canvas: HTMLCanvasElement;
    protected canvasContext: CanvasRenderingContext2D;
    constructor(value: string, options?: OptionsInput$2);
    protected _clearCache(): void;
    protected _getCanvasSize(): number | null;
    draw(canvas?: HTMLCanvasElement | null): HTMLCanvasElement | Promise<HTMLCanvasElement> | null;
    protected _getImageSource(imageConfig: ImageConfig): ImageSource | null;
    protected _drawImage(qrCodeCanvasContext: CanvasRenderingContext2D, pixelSize: number): true | Promise<void> | null;
    getCanvas(): HTMLCanvasElement | Promise<HTMLCanvasElement> | null;
    toDataUrl(type?: string, encoderOptions?: number): string | Promise<string> | null;
}

declare const TYPE_INT_WHITE: 0;
declare const TYPE_INT_BLACK: 1;
declare const TYPE_INT_PROCESSED: 2;
type CellInt = typeof TYPE_INT_WHITE | typeof TYPE_INT_BLACK | typeof TYPE_INT_PROCESSED;
type DataInt = CellInt[][];
type Rect = {
    x: number;
    y: number;
    width?: number;
    height?: number;
    id?: string;
};
type OptionsInput$1 = OptionsInput$4 & {
    fgColor?: string;
    bgColor?: string;
};
declare class QRCodeSVG extends AbstractQRCodeWithImage {
    fgColor: string;
    bgColor: string;
    protected qrCodeSVG: string | null;
    protected qrCodeDataUrl: string | null;
    constructor(value: string, options?: OptionsInput$1);
    protected _clearCache(): void;
    protected _getDataInt(): DataInt | null;
    protected _getRects(): Rect[] | null;
    protected _processRect(dataInt: DataInt, begX: number, endX: number, begY: number): Rect | null;
    protected _getRelativeRects(): Rect[] | null;
    protected _buildSVG(rects: Rect[]): string;
    toString(): string | null;
    toDataUrl(): string | null;
}

type OptionsInput = OptionsInput$4 & {
    blackSymbol?: string;
    whiteSymbol?: string;
};
declare class QRCodeText extends QRCodeRaw {
    blackSymbol: string;
    whiteSymbol: string;
    protected qrCodeText: string | null;
    constructor(value: string, options?: OptionsInput);
    protected _clearCache(): void;
    toString(): string | null;
}

export { AbstractQRCodeWithImage, type ErrorCorrectionLevelType, type ImageConfig, type ImageSource, QRCodeCanvas, type QRCodeDataType, QRCodeRaw, type Options as QRCodeRawOptions, QRCodeSVG, QRCodeText };
