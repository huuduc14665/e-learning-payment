require('rootpath')();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./helpers/error-handler');
const routes = require('./routes');
const config = require('config.json');


//add config to url encoded & CORS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


//api route
app.use("/api", routes)

//use global error handler
app.use(errorHandler)




//connect to MongoDB
mongoose.connect( config.connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
mongoose.connection.on('error', console.error.bind(console, 'Database connection error:'));
mongoose.connection.once('open', function () {
  console.info('Successfully connected to the database');
});

//assign server port and start it
const port = process.env.NODE_ENV === 'production' ? 80 : 3000;
const server = app.listen(port, function () {
    console.log(`Server started with port: ${port}`)
});
