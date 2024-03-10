const { MongoClient } = require("mongodb");
require('dotenv').config();

// Create mongodb client
const client = new MongoClient(process.env.DB_URI);

// Function to initialize database
async function run() {
  try {
    // Connect to and ping database
    await client.connect();
    await client.db(process.env.DB_ID).command({ ping: 1 });

  } catch (er) {
    console.log("MongoDB connection failed");
    console.log(er)
  }

  return
}

run(); // Call initialization function 

async function addId(id, token) {
  // check if account already exists
  const query = await client.db(process.env.DB_ID).collection('userAccounts').findOne({
    id: id,
  });

  if (query) {
    // an accounts already exists, run an update using the query _id as the index
    client.db(process.env.DB_ID).collection('userAccounts').updateOne(
      {_id: query._id},
      {$set: {token:token}}
    );
  } else {
    // no account exists for this id, create a new one
    client.db(process.env.DB_ID).collection('userAccounts').insertOne({
      token: token,
      id: id,
      createdAt: Date.now(),   
      sitePermissionLevel: 1
    });
  }
}

async function getId(token) { // Simply find and return the document that matches the token
    const query = await client.db(process.env.DB_ID).collection('userAccounts').findOne({
      token: token,
    });

    return query
}

async function createArticle(info) {
  const count = await client.db(process.env.DB_ID).collection('articles').countDocuments();

  client.db(process.env.DB_ID).collection('articles').insertOne({
    id: (count + 1).toString(),
    ownerId: info.owner,
    title: info.title,
    body: info.body,
    createdAt: Date.now(),
    type: info.articleType,
    views: 0
  });
}

async function getArticle(id) {
  const query = await client.db(process.env.DB_ID).collection('articles').findOne({
    id: id,
  });

  client.db(process.env.DB_ID).collection('articles').updateOne(
    {_id: query._id},
    {$set: {views:query.views + 1}}
  );

  return query
}

async function findArticle(query, type) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({
    title: { $regex: new RegExp(query, 'i') }, // Case-insensitive partial match for title
    type: { $eq: type } // Exact match for type
  });

  return dbquery
}

async function findAllArticles(type) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({
    type: type
  });

  return dbquery
}


module.exports = {
  addId, 
  getId, 
  getArticle, 
  createArticle,
  findArticle,
  findAllArticles
};