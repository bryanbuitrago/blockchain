import { Block, Blockchain } from './ytBlockchain.js';

const kojiCoin = new Blockchain();

kojiCoin.addBlock(new Block(1, '04/02/2024', { amount: 4 }));
kojiCoin.addBlock(new Block(2, '04/03/2024', { amount: 10 }));

console.log(JSON.stringify(kojiCoin, null, 4));
