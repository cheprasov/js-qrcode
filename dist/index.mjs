import QRCodeCore from 'qr.js/lib/QRCode';
import ErrorCorrectLevel from 'qr.js/lib/ErrorCorrectLevel';

// src/utils/ColorUtils.ts
var ColorUtils = class {
  static convertHexColorToBytes(hexColor) {
    const bytes = [];
    let hex = hexColor.replace("#", "");
    if (!/^[0-9A-F]{3,8}$/i.test(hex)) {
      return [0, 0, 0, 0];
    }
    switch (hex.length) {
      case 3:
        hex += "F";
      // Fall through
      case 4:
        bytes.push(...hex.split("").map((h) => parseInt(h.repeat(2), 16)));
        break;
      case 6:
        hex += "FF";
      // Fall through
      case 8:
        bytes.push(parseInt(hex.substring(0, 2), 16));
        bytes.push(parseInt(hex.substring(2, 4), 16));
        bytes.push(parseInt(hex.substring(4, 6), 16));
        bytes.push(parseInt(hex.substring(6, 8), 16));
        break;
      default:
        bytes.push(0, 0, 0, 0);
    }
    return bytes;
  }
};
var ERROR_CORRECTION_LEVEL_LOW = "L";
var DEFAULT_CONSTRUCTOR_PARAMS = {
  level: ERROR_CORRECTION_LEVEL_LOW,
  padding: 1,
  invert: false,
  typeNumber: 0,
  errorsEnabled: false
};
var QRCodeRaw = class {
  constructor(value, options = {}) {
    this.qrCodeData = null;
    const params = { ...DEFAULT_CONSTRUCTOR_PARAMS, ...options };
    this.value = value;
    this.level = params.level;
    this.typeNumber = params.typeNumber;
    this.padding = params.padding;
    this.invert = params.invert;
    this.errorsEnabled = params.errorsEnabled;
  }
  setValue(value) {
    this.value = value;
    this._clearCache();
  }
  getDataSize() {
    const data = this.getData();
    return data ? data.length : 0;
  }
  _clearCache() {
    this.qrCodeData = null;
  }
  _getQrCodeData(modules) {
    const qrCodeData = [];
    const padding = this.padding;
    const invert = this.invert;
    const rowPadding = Array(padding * 2 + modules.length).fill(invert);
    const rowsPadding = Array(padding).fill(rowPadding);
    const columnPadding = Array(padding).fill(invert);
    if (padding) {
      qrCodeData.push(...rowsPadding);
    }
    modules.forEach((row) => {
      const qrCodeRow = [];
      qrCodeRow.push(
        ...columnPadding,
        ...row.map((isBlack) => invert ? !isBlack : isBlack),
        ...columnPadding
      );
      qrCodeData.push(qrCodeRow);
    });
    if (padding) {
      qrCodeData.push(...rowsPadding);
    }
    return qrCodeData;
  }
  getData() {
    if (!this.qrCodeData) {
      try {
        const qrcode = new QRCodeCore(this.typeNumber, ErrorCorrectLevel[this.level]);
        qrcode.addData(this.value);
        qrcode.make();
        if (!qrcode.modules) {
          return null;
        }
        this.qrCodeData = this._getQrCodeData(qrcode.modules);
        Object.freeze(this.qrCodeData);
      } catch (error) {
        if (this.errorsEnabled) {
          throw error;
        }
        return null;
      }
    }
    return this.qrCodeData;
  }
};

// src/utils/DimensionUtils.ts
var DimensionUtils = class {
  static calculateDimension(value, canvasSize) {
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "string" && value.indexOf("%") > 0) {
      return Math.round(parseFloat(value) / 100 * canvasSize) || 0;
    }
    return parseFloat(value) || 0;
  }
  static calculatePosition(value, size, canvasSize) {
    var _a;
    if (typeof value === "number") {
      return value;
    }
    if (typeof value !== "string") {
      return 0;
    }
    if (value === "left" || value === "top") {
      return 0;
    }
    if (value === "right" || value === "bottom") {
      return canvasSize - size;
    }
    if (value === "center") {
      return Math.round((canvasSize - size) / 2);
    }
    const match = value.match(/^(?:(right|bottom|left|top)\s+)?(-?[0-9.]+)(%)?$/);
    if (!match) {
      return 0;
    }
    const isRight = match[1] === "right" || match[1] === "bottom";
    const isPercent = !!match[3];
    let val = parseFloat((_a = match[2]) != null ? _a : "0") || 0;
    if (isPercent) {
      val = Math.round(val / 100 * canvasSize);
    }
    if (isRight) {
      val = canvasSize - val - size;
    }
    return Math.round(val);
  }
};

// src/AbstractQRCodeWithImage.ts
var DEFAULT_OPTIONS = {
  image: null
};
var DEFAULT_IMAGE_BORDER = 1;
var AbstractQRCodeWithImage = class extends QRCodeRaw {
  constructor(value, options = {}) {
    var _a;
    super(value, options);
    this.image = null;
    this.imageConfig = null;
    const params = { ...DEFAULT_OPTIONS, ...options };
    this.image = (_a = params.image) != null ? _a : null;
  }
  _clearCache() {
    super._clearCache();
    this.imageConfig = null;
  }
  _getImageSource(imageConfig) {
    const source = imageConfig.source;
    if (typeof source === "string") {
      return source;
    }
    if (source instanceof Image) {
      return source.src;
    }
    if (source instanceof HTMLCanvasElement) {
      return source.toDataURL();
    }
    if (source instanceof Promise) {
      return source;
    }
    return null;
  }
  _getImageConfig() {
    if (this.imageConfig) {
      return this.imageConfig;
    }
    if (!this.image || !this.image.source || !this.image.width || !this.image.height) {
      return null;
    }
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }
    const source = this._getImageSource(this.image);
    if (!source) {
      return null;
    }
    const dataSizeWithoutPadding = dataSize - this.padding * 2;
    const width = DimensionUtils.calculateDimension(this.image.width, dataSizeWithoutPadding);
    const height = DimensionUtils.calculateDimension(this.image.height, dataSizeWithoutPadding);
    const x = DimensionUtils.calculatePosition(this.image.x, width, dataSizeWithoutPadding) + this.padding;
    const y = DimensionUtils.calculatePosition(this.image.y, height, dataSizeWithoutPadding) + this.padding;
    let border = DEFAULT_IMAGE_BORDER;
    if (typeof this.image.border === "number" || this.image.border === null) {
      border = this.image.border;
    }
    this.imageConfig = { source, border, x, y, width, height };
    return this.imageConfig;
  }
  getData() {
    if (this.qrCodeData) {
      return this.qrCodeData;
    }
    const data = super.getData();
    if (!data) {
      return data;
    }
    const imageConfig = this._getImageConfig();
    if (imageConfig && imageConfig.width && imageConfig.height) {
      if (typeof imageConfig.border === "number") {
        const begX = Math.max(imageConfig.x - imageConfig.border, 0);
        const begY = Math.max(imageConfig.y - imageConfig.border, 0);
        const endX = Math.min(begX + imageConfig.width + imageConfig.border * 2, data.length);
        const endY = Math.min(begY + imageConfig.height + imageConfig.border * 2, data.length);
        for (let y = begY; y < endY; y += 1) {
          for (let x = begX; x < endX; x += 1) {
            data[y][x] = this.invert ? true : false;
          }
        }
      }
    }
    return data;
  }
};

// src/loader/ImageLoader.ts
var ImageLoader = class {
  static load(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(img);
      img.src = url;
    });
  }
};

// src/QRCodeCanvas.ts
var DEFAULT_OPTIONS2 = {
  fgColor: "#000",
  bgColor: "#FFF",
  scale: 10,
  size: null
};
var QRCodeCanvas = class extends AbstractQRCodeWithImage {
  constructor(value, options = {}) {
    super(value, options);
    const params = { ...DEFAULT_OPTIONS2, ...options };
    this.fgColor = params.fgColor;
    this.bgColor = params.bgColor;
    this.scale = params.scale;
    this.size = params.size;
    this.canvas = document.createElement("canvas");
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Cannot acquire 2d canvas context");
    }
    this.canvasContext = ctx;
    this.toDataURL = this.toDataUrl.bind(this);
  }
  _clearCache() {
    super._clearCache();
    this.canvas.width = 0;
  }
  _getCanvasSize() {
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }
    if (this.size) {
      return this.size;
    }
    if (this.scale) {
      return this.scale * dataSize;
    }
    return dataSize;
  }
  draw(canvas = null) {
    var _a;
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }
    const data = this.getData();
    if (!data) {
      return null;
    }
    const fgColor = ColorUtils.convertHexColorToBytes(this.fgColor);
    const bgColor = ColorUtils.convertHexColorToBytes((_a = this.bgColor) != null ? _a : "#FFF");
    let index = 0;
    const bytes = new Uint8ClampedArray(dataSize ** 2 * 4);
    data.forEach((row) => {
      row.forEach((isBlack) => {
        bytes.set(isBlack ? fgColor : bgColor, index);
        index += 4;
      });
    });
    const imageData = new ImageData(bytes, dataSize, dataSize);
    this.canvas.width = dataSize;
    this.canvas.height = dataSize;
    this.canvasContext.putImageData(imageData, 0, 0);
    const canvasSize = this._getCanvasSize();
    if (!canvasSize) {
      return null;
    }
    const qrCodeCanvas = canvas != null ? canvas : document.createElement("canvas");
    qrCodeCanvas.width = canvasSize;
    qrCodeCanvas.height = canvasSize;
    const qrCodeCanvasContext = qrCodeCanvas.getContext("2d");
    if (!qrCodeCanvasContext) {
      throw new Error("Cannot acquire 2d canvas context");
    }
    qrCodeCanvasContext.imageSmoothingEnabled = false;
    qrCodeCanvasContext.drawImage(this.canvas, 0, 0, canvasSize, canvasSize);
    const drawImageResult = this._drawImage(qrCodeCanvasContext, canvasSize / dataSize);
    if (drawImageResult instanceof Promise) {
      return drawImageResult.then(() => qrCodeCanvas);
    }
    return qrCodeCanvas;
  }
  _getImageSource(imageConfig) {
    const source = imageConfig.source;
    if (typeof source === "string") {
      return ImageLoader.load(source).then((image) => {
        if (this.image) {
          this.image.source = image;
        }
        imageConfig.source = image;
        return image;
      });
    }
    if (source instanceof Image) {
      return source;
    }
    if (source instanceof HTMLCanvasElement) {
      return source;
    }
    return null;
  }
  _drawImage(qrCodeCanvasContext, pixelSize) {
    const imageConfig = this._getImageConfig();
    if (!imageConfig) {
      return null;
    }
    if (imageConfig.source instanceof Promise) {
      return imageConfig.source.then((image) => {
        qrCodeCanvasContext.drawImage(
          image,
          imageConfig.x * pixelSize,
          imageConfig.y * pixelSize,
          imageConfig.width * pixelSize,
          imageConfig.height * pixelSize
        );
      });
    }
    qrCodeCanvasContext.drawImage(
      imageConfig.source,
      imageConfig.x * pixelSize,
      imageConfig.y * pixelSize,
      imageConfig.width * pixelSize,
      imageConfig.height * pixelSize
    );
    return true;
  }
  getCanvas() {
    return this.draw();
  }
  toDataUrl(type = "image/png", encoderOptions = 0.92) {
    const canvasOrPromise = this.draw();
    if (!canvasOrPromise) {
      return null;
    }
    if (canvasOrPromise instanceof Promise) {
      return canvasOrPromise.then((qrCodeCanvas) => qrCodeCanvas.toDataURL(type, encoderOptions));
    }
    return canvasOrPromise.toDataURL(type, encoderOptions);
  }
};

// src/QRCodeSVG.ts
var TYPE_INT_WHITE = 0;
var TYPE_INT_BLACK = 1;
var TYPE_INT_PROCESSED = 2;
var DEFAULT_OPTIONS3 = {
  fgColor: "#000",
  bgColor: "#FFF"
};
var QRCodeSVG = class extends AbstractQRCodeWithImage {
  constructor(value, options = {}) {
    super(value, options);
    this.qrCodeSVG = null;
    this.qrCodeDataUrl = null;
    const params = { ...DEFAULT_OPTIONS3, ...options };
    this.fgColor = params.fgColor;
    this.bgColor = params.bgColor;
    this.toDataURL = this.toDataUrl.bind(this);
  }
  _clearCache() {
    super._clearCache();
    this.qrCodeSVG = null;
    this.qrCodeDataUrl = null;
  }
  _getDataInt() {
    const data = this.getData();
    if (!data) {
      return null;
    }
    return data.map((row) => row.map((isBlack) => isBlack ? TYPE_INT_BLACK : TYPE_INT_WHITE));
  }
  _getRects() {
    const dataInt = this._getDataInt();
    if (!dataInt) {
      return null;
    }
    const rects = [];
    const count = dataInt.length - 1;
    for (let y = 0; y <= count; y += 1) {
      let begX = -1;
      for (let x = 0; x <= count; x += 1) {
        const intType = dataInt[y][x];
        const isLast = x === count;
        const isBlack = intType === TYPE_INT_BLACK;
        if (isBlack && begX === -1) {
          begX = x;
        }
        if (begX !== -1 && (isLast || !isBlack)) {
          const endX = x - (isBlack ? 0 : 1);
          const rect = this._processRect(dataInt, begX, endX, y);
          if (rect) {
            rects.push(rect);
          }
          begX = -1;
        }
      }
    }
    return rects;
  }
  _processRect(dataInt, begX, endX, begY) {
    const count = dataInt.length - 1;
    let isNewRect = false;
    let isStopped = false;
    let height = 0;
    for (let y = begY; y <= count; y += 1) {
      for (let x = begX; x <= endX; x += 1) {
        const intType = dataInt[y][x];
        if (intType === TYPE_INT_WHITE) {
          isStopped = true;
          break;
        }
      }
      if (isStopped) {
        break;
      }
      for (let x = begX; x <= endX; x += 1) {
        if (dataInt[y][x] === TYPE_INT_BLACK) {
          isNewRect = true;
          dataInt[y][x] = TYPE_INT_PROCESSED;
        }
      }
      height += 1;
    }
    if (!isNewRect) {
      return null;
    }
    return {
      x: begX,
      y: begY,
      width: endX - begX + 1,
      height
    };
  }
  _getRelativeRects() {
    const rects = this._getRects();
    if (!rects) {
      return null;
    }
    const relativeRects = [];
    const rectsMap = {};
    let seqRectId = 0;
    rects.forEach((rect) => {
      const key = `${rect.width}:${rect.height}`;
      if (rectsMap[key]) {
        rectsMap[key].count += 1;
        if (!rectsMap[key].id) {
          rectsMap[key].id = `i${seqRectId.toString(32)}`;
          seqRectId += 1;
        }
      } else {
        rectsMap[key] = { count: 1, rect, relative: false, id: null };
      }
    });
    rects.forEach((rect) => {
      const key = `${rect.width}:${rect.height}`;
      const rectsMapItem = rectsMap[key];
      if (rectsMapItem.relative) {
        relativeRects.push({
          id: rectsMapItem.id,
          x: rect.x - rectsMapItem.rect.x,
          y: rect.y - rectsMapItem.rect.y
        });
      } else {
        if (rectsMapItem.id) {
          rect.id = rectsMapItem.id;
          rectsMapItem.relative = true;
        }
        relativeRects.push(rect);
      }
    });
    return relativeRects;
  }
  _buildSVG(rects) {
    const size = this.getDataSize();
    const tags = [
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" shape-rendering="crispEdges" viewBox="0 0 ${size} ${size}">`
    ];
    if (this.bgColor) {
      tags.push(`<rect x="0" y="0" height="${size}" width="${size}" fill="${this.bgColor}"/>`);
    }
    rects.forEach((rect) => {
      if (rect.width && rect.height) {
        const rectId = rect.id ? `id="${rect.id}" ` : "";
        tags.push(
          `<rect ${rectId}x="${rect.x}" y="${rect.y}" height="${rect.height}" width="${rect.width}" fill="${this.fgColor}"/>`
        );
      } else {
        tags.push(`<use xlink:href="#${rect.id}" x="${rect.x}" y="${rect.y}"/>`);
      }
    });
    const imageConfig = this._getImageConfig();
    if (imageConfig && imageConfig.width && imageConfig.height) {
      tags.push(
        `<image xlink:href="${imageConfig.source}" x="${imageConfig.x}" y="${imageConfig.y}" width="${imageConfig.width}" height="${imageConfig.height}"/>`
      );
    }
    tags.push("</svg>");
    return tags.join("");
  }
  toString() {
    if (!this.qrCodeSVG) {
      const dataSize = this.getDataSize();
      if (!dataSize) {
        return null;
      }
      const rects = this._getRects();
      if (!rects) {
        return null;
      }
      this.qrCodeSVG = this._buildSVG(rects);
    }
    return this.qrCodeSVG;
  }
  toDataUrl() {
    if (!this.qrCodeDataUrl) {
      const dataSize = this.getDataSize();
      if (!dataSize) {
        return null;
      }
      const relativeRects = this._getRelativeRects();
      if (!relativeRects) {
        return null;
      }
      const svg = this._buildSVG(relativeRects);
      this.qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
    }
    return this.qrCodeDataUrl;
  }
};

// src/QRCodeText.ts
var DEFAULT_OPTIONS4 = {
  blackSymbol: "\u2593\u2593",
  whiteSymbol: "  "
};
var QRCodeText = class extends QRCodeRaw {
  constructor(value, options = {}) {
    super(value, options);
    this.qrCodeText = null;
    const params = { ...DEFAULT_OPTIONS4, ...options };
    this.blackSymbol = params.blackSymbol;
    this.whiteSymbol = params.whiteSymbol;
  }
  _clearCache() {
    super._clearCache();
    this.qrCodeText = null;
  }
  toString() {
    if (this.qrCodeText) {
      return this.qrCodeText;
    }
    const dataSize = this.getDataSize();
    if (!dataSize) {
      return null;
    }
    const data = this.getData();
    if (!data) {
      return null;
    }
    const symbols = [];
    for (let y = 0; y < dataSize; y += 1) {
      for (let x = 0; x < dataSize; x += 1) {
        const isBlack = data[y][x];
        symbols.push(isBlack ? this.blackSymbol : this.whiteSymbol);
      }
      symbols.push("\n");
    }
    this.qrCodeText = symbols.join("");
    return this.qrCodeText;
  }
};

export { AbstractQRCodeWithImage, QRCodeCanvas, QRCodeRaw, QRCodeSVG, QRCodeText };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map