import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
dotenv.config();

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

async function addId(id : string, token : string) {
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
      sitePermissionLevel: 1,
      favoriteRoutes: [],
      settings: {
        darkMode: true
      }
    });
  }
}

async function editId(id : string, edits : profileEditRequest) {
  // check if account already exists
  const query = await client.db(process.env.DB_ID).collection('userAccounts').findOne({
    id: id,
  });

  if (query) {
    client.db(process.env.DB_ID).collection('userAccounts').updateOne(
      { _id: query._id },
      { $set: {
        favoriteRoutes: edits.favoriteRoutes,
        settings: edits.settings 
      } }
    );
  }
}

async function getId(token : string) { // Simply find and return the document that matches the token
    const query = await client.db(process.env.DB_ID).collection('userAccounts').findOne({
      token: token,
    });

    return query
}

async function getUserById(id : string) { // Return profile by the userid
  const query = await client.db(process.env.DB_ID).collection('userAccounts').findOne({
    id: id,
  });

  return query
}

async function createArticle(info : baseArticleObject) {
  const count : number = await client.db(process.env.DB_ID).collection('articles').countDocuments();
  const id = (count + 1).toString()

  await client.db(process.env.DB_ID).collection('articles').insertOne({
    id: id,
    owner: info.owner,
    title: info.title,
    body: info.body,
    createdAt: Date.now(),
    type: info.type,
    views: 0,
    tags: info.tags
  });

  return id
}

async function getArticle(id : string) : Promise<articleObject | null> {
  const query = await client.db(process.env.DB_ID).collection('articles').findOne({
    id: id,
  });

  if (query) {
    client.db(process.env.DB_ID).collection('articles').updateOne(
      { _id: query._id },
      { $set: { views: query.views + 1 } }
    );

    const result : articleObject = JSON.parse(JSON.stringify(query))
    return result

  } else {
    return null
  }
}

async function editArticle(id : string, title: string, body : string, tags : Array<string>) {
  const query = await client.db(process.env.DB_ID).collection('articles').findOne({
    id: id,
  });

  if (query) {
    client.db(process.env.DB_ID).collection('articles').updateOne(
      { _id: query._id },
      { $set: {
        title: title,
        body: body,
        tags: tags
      } }
    );
  }
}

async function findArticle(query : string, type : string) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({
    title: { $regex: new RegExp(query, 'i') }, // Case-insensitive partial match for title
    type: { $eq: type } // Exact match for type
  });

  return dbquery
}

async function findArticlesWithTag(tag : string) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({ tags: { $in: [tag] } })

  return dbquery
}

async function findArticlesFromUser(user : string) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({owner:user})

  return dbquery
}

async function findAllArticles(type : string) {
  const dbquery = client.db(process.env.DB_ID).collection('articles').find({
    type: type
  });

  return dbquery
}

async function deleteArticle(id : string) {
  const dbquery = await client.db(process.env.DB_ID).collection('articles').deleteOne({id: id})

  if (dbquery.deletedCount === 1) {
    return true
  } else {
    return false
  }
}

module.exports = {
  addId, 
  getId, 
  editId,
  getArticle, 
  createArticle,
  findArticle,
  findAllArticles,
  deleteArticle,
  editArticle,
  findArticlesWithTag,
  findArticlesFromUser,
  getUserById
};