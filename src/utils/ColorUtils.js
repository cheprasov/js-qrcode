
export default class ColorUtils {

    static convertHexColorToBytes(hexColor: string): number[] {
        const bytes: number[] = [];
        let hex = hexColor.replace('#', '');

        if (!/^[0-9A-F]{3,8}$/i.test(hex)) {
            return [0, 0, 0, 0];
        }

        switch (hex.length) {
            case 3:
                hex += 'F';
            // Fall through
            case 4:
                bytes.push(...hex.split('').map(h => parseInt(h.repeat(2), 16)));
                break;
            case 6:
                hex += 'FF';
            // Fall through
            case 8:
                bytes.push(parseInt(hex.substr(0, 2), 16));
                bytes.push(parseInt(hex.substr(2, 2), 16));
                bytes.push(parseInt(hex.substr(4, 2), 16));
                bytes.push(parseInt(hex.substr(6, 2), 16));
                break;
            default:
                bytes.push(0, 0, 0, 0);
        }
        return bytes;
    }

}
