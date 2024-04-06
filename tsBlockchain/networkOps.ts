import fetch from 'node-fetch';

// export interface Block {
//     index: number;
//     timestamp: string;
//     transactions: Transaction[];
//     nonce: number;
//     hash: string;
//     previousBlockHash: string;
//   }

export const broadcastNewBlock = async (newBlock: any) => {
  const requestPromises = oroCoin.networkNodes.map(async (networkNodeUrl) => {
    try {
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
    } catch (error: any) {
      console.error(`Error broadcasting to ${networkNodeUrl}:`, error);
      return { error: true };
    }
  });
  return Promise.all(requestPromises);
};
