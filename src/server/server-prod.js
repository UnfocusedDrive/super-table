import path from 'path';
import express from 'express';
import cors from 'cors';
import CONSTANT from './constants';

const DIST_DIR = __dirname;
const HTML_FILE = path.join(DIST_DIR, 'index.html');

const app = express();
app.use(cors());
app.use(express.static(DIST_DIR))

app.get('/', (req, res) => {
    console.log('launched...');
    res.sendFile(HTML_FILE);
});

app.get('/test', (req, res) => {
  console.log('/test : Test request received. Are you as excited as me?');
  res.send('Hello, is it me you\'re looking for?');
});

const PORT = process.env.PORT || CONSTANT.PORT;
app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});