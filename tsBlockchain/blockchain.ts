// import sha256 from 'crypto-js/sha256';
import { createHash } from 'crypto';

// Current Node URL
const currentNodeUrl = process.argv[3];

// Type Definitions
type Transaction = any;
type Block = {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: number;
  hash: string;
  previousBlockHash: string;
};

// Blockchain Class
class Blockchain {
  chain: Block[];
  pendingTransactions: Transaction[];
  currentNodeUrl: string;
  networkNodes: string[] = [];

  constructor() {
    this.chain = [];
    this.pendingTransactions = [];

    // Current Node URL
    this.currentNodeUrl = currentNodeUrl;

    // Network Nodes Array
    this.networkNodes = [];

    // Create Genesis Block
    this.createNewBlock(100, '0', '0');
  }

  // Create New Block
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
    if (this.chain.length === 1) console.log('[Genesis Block] === ', newBlock);
    return newBlock;
  }

  // Create New Transaction
  createNewTransaction(amount: number, sender: string, recipient: string) {
    const newTransaction = {
      amount: amount,
      sender: sender,
      recipient: recipient,
    };
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index'] + 1;
  }

  // Hash Block Using Built-in Crypto Module
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

  proofOfWork(previousBlockHash: string, currentBlockData: Transaction[]) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
      // console.log('[Current Hash]= ', hash);
    }
    return nonce;
  }

  // Hash Block Using External Crypto-JS NPM Module
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

  // Get Last Block
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }
}

export default Blockchain;
