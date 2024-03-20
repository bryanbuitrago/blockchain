class Blockchain {
  constructor() {
    this.chain = [];
    this.newTransactions = [];
  }

  createNewBlock(nonce, previousBlockHash, hash) {
    const newBlock = {
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

// ===<< Blockchain With Its Own Block Class >>===

// class Block {
//   constructor(index, timestamp, transactions, nonce, hash, previousBlockHash) {
//     this.index = index;
//     this.timestamp = timestamp;
//     this.transactions = transactions;
//     this.nonce = nonce;
//     this.hash = hash;
//     this.previousBlockHash = previousBlockHash;
//   }
// }

// class Blockchain {
//   constructor() {
//     this.chain = [];
//     this.newTransactions = [];
//   }

//   createNewBlock(nonce, previousBlockHash, hash) {
//     const newBlock = new Block(
//       this.chain.length + 1,
//       Date.now(),
//       this.newTransactions,
//       nonce,
//       hash,
//       previousBlockHash
//     );

//     this.newTransactions = [];
//     this.chain.push(newBlock);
//     return newBlock;
//   }
// }
// ===<< End Of Blockchain With Its Own Block Class >>===
