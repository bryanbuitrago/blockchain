// import sha256 from 'crypto-js/sha256';
import { createHash } from 'crypto';

type Transaction = any;
type Block = {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousBlockHash: string;
};

class Blockchain {
  chain: Block[];
  pendingTransactions: Transaction[];

  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
  }

  createNewBlock(nonce: number, previousBlockHash: string, hash: string) {
    const newBlock: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce: nonce,
      hash: hash,
      previousBlockHash: previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }

  createNewTransaction(amount: number, sender: string, recipient: string) {
    const newTransaction = {
      amount: amount,
      sender: sender,
      recipient: recipient,
    };
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index'] + 1;
  }

  // ===<< Hash Block Using Built-in Crypto Module >>===
  hashBlock(
    previousBlockHash: string,
    currentBlockData: Transaction[],
    nonce: number
  ) {
    const dataAsString = `${previousBlockHash}${nonce}${JSON.stringify(
      currentBlockData
    )}`;
    const hash = createHash('sha256').update(dataAsString).digest('hex');
    return hash;
  }

  // ===<< Hash Block Using External Crypto-JS NPM Module >>===
  // hashBlock(
  //   previousBlockHash: string,
  //   currentBlockData: Transaction[],
  //   nonce: number
  // ) {
  //   const dataAsString = `${previousBlockHash}${nonce}${JSON.stringify(
  //     currentBlockData
  //   )}`;
  //   const hash = sha256(dataAsString).toString();
  //   return hash;
  // }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }
}

export default Blockchain;
