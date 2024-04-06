import fetch from 'node-fetch';
export const rewardMiner = async (
  sender: string,
  recipient: string,
  amount: number
) => {
  const requestOptions = {
    method: 'POST',
    body: JSON.stringify({
      sender,
      amount,
      recipient,
    }),
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(
    oroCoin.networkNodes[0] + '/transaction/broadcast',
    requestOptions
  );
  if (!response.ok) {
    throw new Error('Failed to reward miner. Transaction broadcast failed.');
  }
};
