import Blockchain from './blockchain.js';
const bitcoin = new Blockchain();

// ===<< Create New Block Tests >>===
// Uncomment to test creating new blocks
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');

// ===<< Create New Transaction Tests >>===
// const newBlock1 = bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// const pendingTransaction1 = bitcoin.createNewTransaction(
//   100,
//   'ALEX90NANAN',
//   'JEN90ANDN'
// );

// console.log('[New Block 1] === ', newBlock1);
// console.log('[Pending Transaction 1] === ', pendingTransaction1);

// const newBlock2 = bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// const pendingTransaction2 = bitcoin.createNewTransaction(
//   50,
//   'ALEX90NANAN',
//   'JEN90ANDN'
// );
// const pendingTransaction3 = bitcoin.createNewTransaction(
//   300,
//   'ALEX90NANAN',
//   'JEN90ANDN'
// );
// const pendingTransaction4 = bitcoin.createNewTransaction(
//   2000,
//   'ALEX90NANAN',
//   'JEN90ANDN'
// );

// console.log('[New Block 2] === ', newBlock2);
// console.log('[Pending Transaction 2] === ', pendingTransaction2);
// console.log('[Pending Transaction 3] === ', pendingTransaction3);
// console.log('[Pending Transaction 4] === ', pendingTransaction4);

// ===<< Hash Block Tests >>===
// const previousBlockHash = '90ANDN0N90N';
// const currentBlockData = [
//   {
//     amount: 10,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
//   {
//     amount: 30,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
//   {
//     amount: 200,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
// ];

// const nonce = 100;
// const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
// console.log('[Hash] === ', hash);

// ===<< Proof Of Work Tests >>===
// const previousBlockHash = 'OINAISD90N90N';
// const currentBlockData = [
//   {
//     amount: 101,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
//   {
//     amount: 30,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
//   {
//     amount: 200,
//     sender: 'ALEX90NANAN',
//     recipient: 'JEN90ANDN',
//   },
// ];

// const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
// console.log('[Nonce] === ', nonce);
// const hashNewBlock = bitcoin.hashBlock(
//   previousBlockHash,
//   currentBlockData,
//   nonce
// );
// console.log('[Hash New Block] === ', hashNewBlock);

// ===<< Get Last Block Test >>===
// const lastBlock = bitcoin.getLastBlock();
// console.log('[Last Block] === ', lastBlock);

// ===<< Log The BlockChain >>===
console.log('[BlockChain] === ', bitcoin);
