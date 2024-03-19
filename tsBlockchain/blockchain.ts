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
}

export default Blockchain;
