import express from 'express';
export const app = express();
import path from 'path';
var Bing = require('node-bing-api') ({ accKey: "aa4c730a71ff4c37bdd72c2d26f9dce1"});

import mongod from 'mongodb';
var mLab = "mongodb://" + process.env.IP || "localhost:27017" + "/save-images";
var MongoClient = mongod.MongoClient;

app.use(express.static('styles'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/../index.html'));
});

app.get('/search/:query', (req, res) => {
    MongoClient.connect(mLab, function(err, db) {
        if (err) {
            console.log("Unable to connect to server", err);
        } else {
            console.log("Connected to server");
            
            var collection = db.collection('links');
            let query = req.params.query,
                timestamp = Date.now();
    
            Bing.images(query, {top: 5}, (error, results, body) => {
                if (error) {
                    res.status(500).json(error);
                } else {
                    res.status(200).json(body.value.map(createResults));
                }
            });
            
            var storage = { term: query, unix: timestamp };
            collection.insert([storage]);
            db.close();
        }
    });
});

app.get('/latest/imagesearch', (req, res) => {
    MongoClient.connect(mLab, function(err, db) {
        if (err) {
            console.log("Unable to connect to server", err);
        } else {
            console.log("Connected to server");
            
            var collection = db.collection('links');
            collection.find().toArray(function(err, docs) {
                return res.json(docs);
            });
            db.close();
        }
    });
});

function createResults(image) {
   return { 
       url: image.name,
       snippet: image.contentUrl,
       thumbnail: image.thumbnailUrl,
       context: image.hostPageDisplayUrl
   };
}