// Serverio konfigūracija

const { admin, customers} = require('./routes/exports.js');
const { port } = require('./config.js');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.use('/admin/', admin);
app.use('/customers/', customers);

app.get('/', (request, response) => {
  response.send('Server is running');
});

app.all('*', (request, response) => {
  response.status(400).send({ error: '404 Page Not Found' });
});

app.listen(port, () => {
  console.log(`Listening on ${port}...`);
});