const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./persistence/db');
const path = require('path');
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use('/public', express.static(__dirname +'/public'));

app.get('/', (req, res) => res.send('API Running'));

// Define routes
app.use('/users', require('./routes/api/users'));
app.use('/auth', require('./routes/api/auth'));
app.use('/desks', require('./routes/api/desks'));
app.use('/reservations', require('./routes/api/reservations'));

app.listen(PORT, function() {
  console.log("Server is running on Port: " + PORT + " " + __dirname);
});
