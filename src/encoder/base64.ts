const isBtoaDefined = typeof btoa !== 'undefined';
const isBufferDefined = typeof Buffer !== 'undefined';

const btoaEncode = (value: string): string => {
    return btoa(value);
}

const bufferEncode = (value: string): string => {
    return Buffer.from(value).toString('base64');
}

const errorEncode = () => {
    if (typeof global !== 'undefined') {
        throw new Error('Node.js Buffer is not defined');
    } else if (typeof window !== 'undefined') {
        throw new Error('Browser "btoa" function is not defined');
    }
    throw new Error('Buffer or btoa function should be defined.');
}

export const base64Encode = isBtoaDefined ? btoaEncode : (
    isBufferDefined ? bufferEncode : errorEncode
);