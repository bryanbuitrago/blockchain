import express from 'express';
import Blockchain from './blockchain.js';
// import { broadcastNewBlock } from './networkOps.js';
// import { rewardMiner } from './transactionOps.js';
import { randomUUID } from 'crypto';
import fetch from 'node-fetch';
// import { rewardMiner } from './transactionOps';

const MINING_REWARD = 12.5;
const REWARD_SENDER_ADDRESS = '00';
const RECIPIENT_MINER_ADDRESS = process.argv[3];

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

const rewardMiner = (amount: number, sender: string, minerAddress: string) => {
  const rewardTransaction = oroCoin.createNewTransaction(
    amount,
    sender,
    minerAddress
  );
  oroCoin.addTransactionToPendingTransactions(rewardTransaction);
};

app.get('/mine', async (req, res) => {
  try {
    const lastBlock = oroCoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = [
      {
        transactions: oroCoin.pendingTransactions,
        index: lastBlock.index + 1,
      },
    ];
    const nonce = oroCoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = oroCoin.hashBlock(
      previousBlockHash,
      currentBlockData,
      nonce
    );
    const newBlock = oroCoin.createNewBlock(
      nonce,
      previousBlockHash,
      blockHash
    );

    // Attempt to broadcast the new block to the entire network
    const requestPromises = oroCoin.networkNodes.map(async (networkNodeUrl) => {
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify({ newBlock }),
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch(
        networkNodeUrl + '/receive-new-block',
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return { success: true };
    });

    await Promise.all(requestPromises);

    // Reward the miner only after successful block broadcast
    rewardMiner(
      MINING_REWARD,
      REWARD_SENDER_ADDRESS,
      // nodeAddress /* CURRENT_NODE_URL as recipient */,
      RECIPIENT_MINER_ADDRESS // Miner's address
      // nodeAddress
    );

    res.json({
      note: 'New block mined, broadcasted, and miner rewarded successfully.',
      block: newBlock,
    });
  } catch (error: any) {
    console.error(error); // Log the error to the console for debugging
    res.status(500).json({
      note: 'Error during block mining, broadcasting, or rewarding the miner.',
      error: error.message || error.toString(),
    });
  }
});

// app.get('/mine', async (req, res) => {
//   const lastBlock = oroCoin.getLastBlock();
//   const previousBlockHash = lastBlock['hash'];
//   const currentBlockData = [
//     {
//       transactions: oroCoin.pendingTransactions,
//       index: lastBlock['index'] + 1,
//     },
//   ];
//   const nonce = oroCoin.proofOfWork(previousBlockHash, currentBlockData);
//   const blockHash = oroCoin.hashBlock(
//     previousBlockHash,
//     currentBlockData,
//     nonce
//   );

//   oroCoin.createNewTransaction(12.5, '00', nodeAddress);

//   const newBlock = oroCoin.createNewBlock(nonce, previousBlockHash, blockHash);

//   // Broadcast the new block to the entire network and handle errors per request
//   try {
//     const requestPromises = oroCoin.networkNodes.map(async (networkNodeUrl) => {
//       const requestOptions = {
//         method: 'POST',
//         body: JSON.stringify({ newBlock }),
//         headers: { 'Content-Type': 'application/json' },
//       };
//       const response = await fetch(
//         networkNodeUrl + '/receive-new-block',
//         requestOptions
//       );
//       if (!response.ok) {
//         throw new Error(`Request failed with status ${response.status}`);
//       }
//       return { success: true };
//     });
//     await Promise.all(requestPromises).then(() => {
//       res.json({
//         note: 'New block mined and broadcasted successfully.',
//         block: newBlock,
//       });
//     });
//   } catch (error: any) {
//     console.error(error); // Log the error to the console for debugging
//     res.status(500).json({
//       note: 'Error mining and broadcasting new block.',
//       error: error.message || error.toString(),
//     });
//   }
// });

app.post('/receive-new-block', (req, res) => {
  const { newBlock } = req.body;
  const lastBlock = oroCoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

  if (correctHash && correctIndex) {
    oroCoin.chain.push(newBlock);
    oroCoin.pendingTransactions = [];
    res.json({
      note: 'New block received and accepted.',
      newBlock,
    });
  } else {
    res.status(400).json({
      note: 'New block rejected.',
      reason: 'Invalid block received.',
    });
  }
});

// ### Fix the following code snippets ###
// // Mine a new block
// app.get('/mine', async (req, res) => {
//   try {
//     const lastBlock = oroCoin.getLastBlock();
//     const previousBlockHash = lastBlock['hash'];
//     const currentBlockData = [
//       {
//         transactions: oroCoin.pendingTransactions,
//         index: lastBlock['index'] + 1,
//       },
//     ];

//     const nonce = oroCoin.proofOfWork(previousBlockHash, currentBlockData);
//     const blockHash = oroCoin.hashBlock(
//       previousBlockHash,
//       currentBlockData,
//       nonce
//     );

//     // Create a new block and add it to the blockchain
//     const newBlock = oroCoin.createNewBlock(
//       nonce,
//       previousBlockHash,
//       blockHash
//     );

//     // Broadcast the new block to the entire network and handle errors per request
//     const broadcastResults = await broadcastNewBlock(newBlock);
//     if (broadcastResults.some((result) => result.error)) {
//       throw new Error('Failed to broadcast to all nodes');
//     }

//     // Reward the miner for mining a new block only after successful broadcast
//     console.log('[Miner URL] === ', oroCoin.currentNodeUrl);
//     await rewardMiner(
//       REWARD_SENDER_ADDRESS,
//       oroCoin.currentNodeUrl,
//       MINING_REWARD
//     );

//     res.json({
//       note: 'New block mined and broadcasted successfully.',
//       block: newBlock,
//     });
//   } catch (error) {
//     console.error(error); // Log the error for debugging
//     res.status(500).json({
//       note: 'Error mining and broadcasting new block.',
//       error:
//         'An error occurred during block mining or broadcasting. Please try again.',
//     });
//   }
// });

// app.post('/receive-new-block', (req, res) => {
//   try {
//     const { newBlock } = req.body;
//     const lastBlock = oroCoin.getLastBlock();
//     const correctHash = lastBlock.hash === newBlock.previousBlockHash;
//     const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

//     if (correctHash && correctIndex) {
//       oroCoin.chain.push(newBlock);
//       oroCoin.pendingTransactions = [];
//       res.json({
//         note: 'New block received and accepted.',
//         newBlock,
//       });
//     } else {
//       res.status(400).json({
//         note: 'New block rejected.',
//         reason: 'Invalid block received.',
//       });
//     }
//   } catch (error) {
//     console.error(error); // Log the error to the console for debugging
//     res.status(500).json({
//       note: 'Error receiving new block.',
//       error: 'An error occurred while receiving the new block.',
//     });
//   }
// });

// async function broadcastNewBlock(newBlock: any) {
//   const requestPromises = oroCoin.networkNodes.map(async (networkNodeUrl) => {
//     try {
//       const requestOptions = {
//         method: 'POST',
//         body: JSON.stringify(newBlock),
//         headers: { 'Content-Type': 'application/json' },
//       };
//       console.log('[Broadcasting to] === ', networkNodeUrl);
//       const response = await fetch(
//         networkNodeUrl + '/receive-new-block',
//         requestOptions
//       );
//       if (!response.ok) {
//         throw new Error(`Request failed with status ${response.status}`);
//       }
//       return { success: true };
//     } catch (error) {
//       console.error(`Error broadcasting to ${networkNodeUrl}:`, error);
//       return { error: true };
//     }
//   });

//   return Promise.all(requestPromises);
// }

// async function rewardMiner(sender: string, recipient: string, amount: number) {
//   const requestOptions = {
//     method: 'POST',
//     body: JSON.stringify({ amount, sender, recipient }),
//     headers: { 'Content-Type': 'application/json' },
//   };
//   const response = await fetch(
//     oroCoin.networkNodes[0] + '/transaction/broadcast',
//     requestOptions
//   );
//   if (!response.ok) {
//     throw new Error('Failed to reward miner. Transaction broadcast failed.');
//   }
// }
// Mine a new block
// app.get('/mine', async (req, res) => {
//   try {
//     const lastBlock = oroCoin.getLastBlock();
//     const previousBlockHash = lastBlock['hash'];
//     const currentBlockData = [
//       {
//         transactions: oroCoin.pendingTransactions,
//         index: lastBlock['index'] + 1,
//       },
//     ];
//     const nonce = oroCoin.proofOfWork(previousBlockHash, currentBlockData);
//     const blockHash = oroCoin.hashBlock(
//       previousBlockHash,
//       currentBlockData,
//       nonce
//     );

//     // oroCoin.createNewTransaction(12.5, '00', nodeAddress);
//     const newBlock = oroCoin.createNewBlock(
//       nonce,
//       previousBlockHash,
//       blockHash
//     );

//     // Broadcast the new block to the entire network and handle errors per request
//     await broadcastNewBlock(newBlock);

//     // Reward the miner for mining a new block only after successful mining and broadcasting
//     await rewardMiner(
//       REWARD_SENDER_ADDRESS,
//       oroCoin.currentNodeUrl,
//       MINING_REWARD
//     );

//     res.json({
//       note: 'New block mined and broadcasted successfully.',
//       block: newBlock,
//     });
//   } catch (error: any) {
//     console.error(error); // Log the error to the console for debugging
//     res.status(500).json({
//       note: 'Error mining and broadcasting new block.',
//       error:
//         'An error occurred during block mining or broadcasting. Please try again.',
//     });
//   }
// });

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
