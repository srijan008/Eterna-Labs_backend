const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./src/config/db');
const orderRoutes = require('./src/routes/orderRoutes');
const { initWebSocketServer } = require('./websocket/wsServer');
const { initOrderQueue } = require('./queue/orderQueue');

const app = express();


app.use(cors());
app.use(express.json()); 
app.use(morgan('dev'));  


app.get('/', (req, res) => {
  res.json({ message: 'Order Execution Engine is running' });
});


app.use('/api/orders', orderRoutes);


const server = http.createServer(app);


initWebSocketServer(server);


initOrderQueue();


const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' Failed to connect to MongoDB:', err);
    process.exit(1);
  });
