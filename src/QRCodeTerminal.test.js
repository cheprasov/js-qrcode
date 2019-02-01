// @flow

import QRCodeTerminal from './QRCodeTerminal';

describe('QRCodeTerminal', () => {

    describe('constructor', () => {
        it('test', () => {
            const q = new QRCodeTerminal(
                'Hello how are you today?',
                {
                    blackSymbol: '  ',
                    whiteSymbol: '▓▓',
                }
            );
            q.padding = 1;
            console.log(q.getAsText());
        });
    });

});
