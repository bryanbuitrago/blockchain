import express from 'express';
import Blockchain from './blockchain.js';
import { randomUUID } from 'crypto';

// Create an instance of the Express.js server
const app = express();

// Create a new instance of the Blockchain class
const oroCoin = new Blockchain();

// Create a unique random node address for this instance of the blockchain
const nodeAddress = randomUUID().split('-').join(''); // split('-').join('') === Remove hyphens
console.log(`[Node Adress] === ${nodeAddress}`);

// Configure the Express.js server to parse JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get the entire blockchain
app.get('/blockchain', (req, res) => {
  res.send({ oroCoin });
});

// Create a new transaction
app.post('/transaction', (req, res) => {
  let transactionNumber = oroCoin.pendingTransactions.length + 1;
  const { amount, sender, recipient } = req.body;
  const blockIndex = oroCoin.createNewTransaction(amount, sender, recipient);
  res.json({
    note: `Transaction Number ${transactionNumber} will be added in block ${blockIndex}.`,
  });
  transactionNumber++;
});

// Mine a new block
app.get('/mine', (req, res) => {
  const lastBlock = oroCoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = [
    {
      transactions: oroCoin.pendingTransactions,
      index: lastBlock['index'] + 1,
    },
  ];
  const nonce = oroCoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = oroCoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  oroCoin.createNewTransaction(12.5, '00', nodeAddress);

  const newBlock = oroCoin.createNewBlock(nonce, previousBlockHash, blockHash);

  res.json({
    note: 'New block mined successfully',
    block: newBlock,
  });
});

const port = process.argv[2];

app.listen(port, () => {
  console.log(`Blockchain App Listening on port ${port}...`);
});
