// const app = require('./src/app.js');
const port = process.env.PORT || 8001;

const express       = require('express');
var bodyParser      = require('body-parser');
var cors            = require('cors');
var dotenv          = require('dotenv');
var MongoClient     = require('mongoose');

const app = express();
app.use(cors());

// Enable environment variable
dotenv.config();

// Connection to MongoDB server
MongoClient.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology: true},function(){
    console.log('Connect to MongoDB');
});

MongoClient.set('useFindAndModify', false);
MongoClient.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({
    extended:true,
    limit: '10mb',
    parameterLimit: 100000
}));
app.use(bodyParser.json()); // take json data

app.use(express.static('public'));
app.use('/',express.static('public'));

process.env.TZ = 'Asia/Kolkata'; // here is the magical line

require('./src/router/admin')(app);
require('./src/router/app')(app);
// module.exports = app;

// Server
app.listen(port, () => {
   console.log(`Listening on: http://localhost:${port}`);
});