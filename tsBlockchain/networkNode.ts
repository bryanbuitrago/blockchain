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
  const { amount, sender, recipient } = req.body;
  const blockIndex = oroCoin.createNewTransaction(amount, sender, recipient);
  res.json({
    note: `Transaction will be added in block ${blockIndex}.`,
  });
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

// Register a new node and broadcast it to the network
app.post('/register-and-broadcast-node', async (req, res) => {
  const { newNodeUrl } = req.body;
  if (!oroCoin.networkNodes.includes(newNodeUrl)) {
    oroCoin.networkNodes.push(newNodeUrl);
  }

  //   Register the new node with the network
  try {
    const regNodesPromises = oroCoin.networkNodes.map(
      async (networkNodeUrl) => {
        const response = await fetch(networkNodeUrl + '/register-node', {
          method: 'POST',
          body: JSON.stringify({ newNodeUrl }),
          headers: { 'Content-Type': 'application/json' },
        });
        return response.json();
      }
    );

    await Promise.all(regNodesPromises).then((data) => {
      const allNetworkNodes = [...data, oroCoin.currentNodeUrl];
      const bulkRegisterOptions = {
        method: 'POST',
        body: JSON.stringify({ allNetworkNodes }),
        headers: { 'Content-Type': 'application/json' },
      };
      return fetch(
        oroCoin.currentNodeUrl + '/register-nodes-bulk',
        bulkRegisterOptions
      );
    });
    res.json({ note: 'New node registered with network successfully.' });
  } catch (error) {
    res
      .status(500)
      .json({ note: 'Error registering new node with network.', error });
  }
});

// Register a node with the network
app.post('/register-node', (req, res) => {
  const { newNodeUrl } = req.body;
  const nodeNotAlreadyPresent = !oroCoin.networkNodes.includes(newNodeUrl);
  const notCurrentNode = oroCoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    oroCoin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: 'New node registered successfully.' });
});

app.post('/register-nodes-bulk', (req, res) => {});

// Start the Express.js server
const port = process.argv[2];
app.listen(port, () => {
  console.log(`Blockchain App Listening on port ${port}...`);
});
