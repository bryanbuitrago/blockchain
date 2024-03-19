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
  newTransactions: Transaction[];

  constructor() {
    this.chain = [];
    this.newTransactions = [];
  }

  createNewBlock(nonce: number, previousBlockHash: string, hash: string) {
    const newBlock: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.newTransactions,
      nonce: nonce,
      hash: hash,
      previousBlockHash: previousBlockHash,
    };
    this.newTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }
}

export default Blockchain;
