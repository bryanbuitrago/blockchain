import express from 'express';
import Blockchain from './blockchain.js';

const app = express();
const bitcoin = new Blockchain();

console.log(bitcoin);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/blockchain', (req, res) => {
  res.send(bitcoin);
});

app.post('/transaction', (req, res) => {
  console.log(req.body);
  res.send(`The amount of the transaction is ${req.body.amount} bitcoin`);
});

app.get('/mine', (req, res) => {
  res.send('Mine a new block');
});

app.listen(3000, () => {
  console.log('Blockchain app listening on port 3000!');
});
