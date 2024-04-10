// import sha256 from 'crypto-js/sha256';
import { createHash, randomUUID } from 'crypto';

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
      transactionId: randomUUID().split('-').join(''), // .split('-').join('') removes hyphens
    };
    return newTransaction;
  }

  // Add Transaction To Pending Transactions
  addTransactionToPendingTransactions(transactionObj: Transaction) {
    this.pendingTransactions.push(transactionObj);
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

  chainIsValid(blockchain: Block[]): boolean {
    let validChain = true;

    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const prevBlock = blockchain[i - 1];
      const blockHash = this.hashBlock(
        prevBlock.hash,
        currentBlock.transactions,
        currentBlock.nonce
      );
      if (blockHash.substring(0, 4) !== '0000') {
        validChain = false;
        break;
      }
      if (currentBlock.previousBlockHash !== prevBlock.hash) {
        validChain = false;
        break;
      }
    }

    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock['nonce'] === 100;
    const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;

    if (
      !correctNonce ||
      !correctPreviousBlockHash ||
      !correctHash ||
      !correctTransactions
    ) {
      validChain = false;
    }

    return validChain;
  }

  // chainIsValid(blockchain: Block[]): boolean {
  //   let validChain = true;

  //   // Validate Genesis Block separately
  //   const genesisBlock = blockchain[0];
  //   const correctNonce = genesisBlock.nonce === 100; // Assuming your genesis block's nonce is 100
  //   const correctPreviousBlockHash = genesisBlock.previousBlockHash === '0'; // Assuming your genesis block's previous hash is '0'
  //   const correctHash = genesisBlock.hash.substring(0, 4) === '0000'; // If your condition for a valid hash is that it starts with '0000'
  //   const correctTransactions = genesisBlock.transactions.length === 0; // If your genesis block should have no transactions

  //   if (
  //     !correctNonce ||
  //     !correctPreviousBlockHash ||
  //     !correctHash ||
  //     !correctTransactions
  //   ) {
  //     return false; // If genesis block is invalid, no need to check the rest
  //   }

  //   // Validate the rest of the blockchain
  //   for (let i = 1; i < blockchain.length; i++) {
  //     const currentBlock = blockchain[i];
  //     const prevBlock = blockchain[i - 1];

  //     // Validate block hash
  //     const blockHash = this.hashBlock(
  //       prevBlock.hash,
  //       currentBlock.transactions,
  //       currentBlock.nonce
  //     );
  //     if (blockHash.substring(0, 4) !== '0000') {
  //       validChain = false;
  //       break; // Exit loop early if any block is invalid
  //     }

  //     // Validate previous block hash link
  //     if (currentBlock.previousBlockHash !== prevBlock.hash) {
  //       validChain = false;
  //       break; // Exit loop early if any block is invalid
  //     }
  //   }

  //   // After full iteration, return the result
  //   return validChain;
  // }

  getBlock(blockHash: string): Block | null {
    return this.chain.find((block) => block.hash === blockHash) || null;
  }

  getTransaction(transactionId: string): Transaction | null {
    for (const block of this.chain) {
      const transaction = block.transactions.find(
        (t) => t.transactionId === transactionId
      );
      if (transaction) {
        return { transaction, block };
      }
    }
    return { transaction: null, block: null };
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
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
}

export default Blockchain;
