const { MongoClient } = require("mongodb");
require('dotenv').config();

// Create mongodb client
const client = new MongoClient(process.env.DB_URI);

// Function to initialize database
async function run() {
  try {
    // Connect to and ping database
    await client.connect();
    await client.db("test").command({ ping: 1 });

    console.log("Successfully connected to MongoDB");
  } catch (er) {
    console.log("MongoDB connection failed");
    console.log(er)
  }

  return
}

run(); // Call initialization function 

function addId(id, token) {
    client.db("test").collection('test').insertOne({
        token: token,
        id: id
    });
}

module.exports = {addId: addId};