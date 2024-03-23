import Blockchain from './blockchain';
const bitcoin = new Blockchain();

// ===<< Create New Block Tests >>===
// Uncomment to test creating new blocks
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');

// ===<< Create New Transaction Tests >>===
const newBlock = bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
const pendingTransaction = bitcoin.createNewTransaction(
  100,
  'ALEX90NANAN',
  'JEN90ANDN'
);

console.log('[New Block] === ', newBlock);
console.log('[Pending Transaction] === ', pendingTransaction);

// ===<< Get Last Block Test >>===
const lastBlock = bitcoin.getLastBlock();
console.log('[Last Block] === ', lastBlock);

// ===<< Log The BlockChain >>===
console.log('[BlockChain] === ', bitcoin);
