const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

let databaseName = ''
const init = async ({dbName}) => {
    await client.connect();
    console.log('Mongodb Connected successfully to server');
    databaseName = dbName
    // db.collection('documents')
}

const getDb = (dbName) => {
   let db = client.db(dbName || databaseName);
   console.log(db)
   return db
}

module.exports = {
    init,
    getDb
}