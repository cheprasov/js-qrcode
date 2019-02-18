
export default class DimensionUtils {

    static calculateDimension(value: string | number, canvasSize: number): number {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string' && value.indexOf('%') > 0) {
            return Math.round(parseFloat(value) / 100 * canvasSize) || 0;
        }
        return parseFloat(value) || 0;
    }

    static calculatePosition(value: string | number, size: number, canvasSize: number): number {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value !== 'string') {
            return 0;
        }
        if (value === 'left' || value === 'top') {
            return 0;
        }
        if (value === 'right' || value === 'bottom') {
            return canvasSize - size;
        }
        if (value === 'center') {
            return Math.round((canvasSize - size) / 2);
        }

        const match = value.match(/^(?:(right|bottom|left|top)\s+)?(-?[0-9.]+)(%)?$/);
        if (!match) {
            return 0;
        }
        const isRight = match[1] === 'right' || match[1] === 'bottom';
        const isPercent = !!match[3];
        let val = parseFloat(match[2]) || 0;

        if (isPercent) {
            val = Math.round(val / 100 * canvasSize);
        }
        if (isRight) {
            val = canvasSize - val - size;
        }
        return Math.round(val);
    }

}
