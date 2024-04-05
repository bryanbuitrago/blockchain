import express from 'express';
import Blockchain from './blockchain.js';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';

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
  const newTransaction = req.body;
  const blockIndex =
    oroCoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post('/transaction/broadcast', async (req, res) => {
  const { amount, sender, recipient } = req.body;
  const newTransaction = oroCoin.createNewTransaction(
    amount,
    sender,
    recipient
  );
  oroCoin.addTransactionToPendingTransactions(newTransaction);

  // Broadcast the new transaction to all the other nodes in the network
  try {
    const requestPromises = oroCoin.networkNodes.map((networkNodeUrl) => {
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(newTransaction),
        headers: { 'Content-Type': 'application/json' },
      };
      // Broadcast the transaction to the network
      return fetch(networkNodeUrl + '/transaction', requestOptions);
    });
    // Execute all the requests in parallel
    await Promise.all(requestPromises).then(() => {
      res.json({ note: 'Transaction created and broadcasted successfully.' });
    });
  } catch (error: any) {
    console.error(error); // Log the error to the console for debugging
    res.status(500).json({
      note: 'Error creating and broadcasting transaction.',
      error: error.message || error.toString(),
    });
  }
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
  console.log('[New Node URL] === ', newNodeUrl);
  if (!oroCoin.networkNodes.includes(newNodeUrl)) {
    oroCoin.networkNodes.push(newNodeUrl);
    console.log('[Network Nodes] === ', oroCoin.networkNodes);
  }

  try {
    // Register the new node with the other nodes in the network
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

    // Before executing Promise.all, ensure newNodeUrl is not included in the bulk registration
    const otherNodes = oroCoin.networkNodes.filter((url) => url !== newNodeUrl);

    // Register the other nodes with the new node
    await Promise.all(regNodesPromises).then((data) => {
      const allNetworkNodes = [...data, oroCoin.currentNodeUrl];
      console.log('[All Network Nodes] === ', allNetworkNodes);
      const bulkRegisterOptions = {
        method: 'POST',
        body: JSON.stringify({
          allNetworkNodes: [...otherNodes, oroCoin.currentNodeUrl],
        }),
        headers: { 'Content-Type': 'application/json' },
      };
      // Register the new node with the other nodes
      return fetch(newNodeUrl + '/register-nodes-bulk', bulkRegisterOptions);
    });
    res.json({ note: 'New node registered with network successfully.' });
  } catch (error: any) {
    console.error(error); // Log the error to the console for debugging
    res.status(500).json({
      note: 'Error registering new node with network.',
      error: error.message || error.toString(),
    });
  }
});

// Register a node with the network
app.post('/register-node', (req, res) => {
  const { newNodeUrl } = req.body;
  const nodeNotAlreadyPresent = !oroCoin.networkNodes.includes(newNodeUrl);
  const notCurrentNodeUrl = oroCoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNodeUrl) {
    oroCoin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: 'New node registered successfully.' });
});

// Register multiple nodes at once
app.post('/register-nodes-bulk', (req, res) => {
  const { allNetworkNodes } = req.body;
  allNetworkNodes.forEach((networkNodeUrl: string) => {
    const nodeNotAlreadyPresent =
      !oroCoin.networkNodes.includes(networkNodeUrl);
    const notCurrentNodeUrl = oroCoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNodeUrl) {
      oroCoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({ note: 'Bulk registration successful.' });
});

// Start the Express.js server
const port = process.argv[2];
app.listen(port, () => {
  console.log(`Blockchain App Listening on port ${port}...`);
});
