import Blockchain from './blockchain';
import { jsonStringify } from './utils';
const bitcoin = new Blockchain();

// ===<< Create New Block Tests >>===
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
// console.log(`[BlockChain] === ${jsonStringify(bitcoin)}`);
// ===>> ::: <<===

// ===<< Create New Transaction Tests >>===
const newBlock = bitcoin.createNewBlock(2389, '0INA90SDNF90N', '90ANDN0N90N');
const pendingTransaction = bitcoin.createNewTransaction(
  100,
  'ALEX90NANAN',
  'JEN90ANDN'
);
console.log(`[New Block] === ${jsonStringify(newBlock)}`);
console.log(
  `[Pending Transactions] === ${jsonStringify(bitcoin.pendingTransactions)}`
);
// ===>> ::: <<===

// ===<< Get Last Block Test >>===
console.log(`[Last Block] === ${jsonStringify(bitcoin.getLastBlock())}`);
// ===>> ::: <<===

// ===<< Log The BlockChain >>===
console.log(`[BlockChain] === ${jsonStringify(bitcoin)}`);
// ===>> ::: <<===
