import Blockchain from './blockchain.js';

const bitcoin = new Blockchain();

bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
bitcoin.createNewBlock(1212, '0INA80SDNF90N', '80ANDN0N90N');
// bitcoin.createNewBlock(4256, '0INA70SDNF90N', '97ANDN0N90N');

console.log(bitcoin);
