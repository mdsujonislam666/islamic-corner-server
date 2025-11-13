const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://islamic-corner:VgKNrJ8rmC2EYw5g@cluster0.skswfst.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('smart server is running')
})

async function run() {
    try {
        await client.connect();

        const db = client.db('islamic_db');
        const productsCollection = db.collection('products');
        const usersCollection = db.collection('users');

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);

        })

        app.get('/products', async (req, res) => {
            // console.log(req.query);
            // const email = req.query.email;
            // const query = {}
            // if(email){
            //     query.email = email;
            // }

            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/allProducts', async (req, res) => {
            const cursor = productsCollection.find().sort({ posted_date: -1 })
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/latest-products', async (req, res) => {
            const cursor = productsCollection.find().sort({ posted_date: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            // console.log(data);
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: data
            }
            const result = await productsCollection.updateOne(query, update)
            res.send(
                {
                    success: true,
                    result
                }

            );
        })

        app.post('/products', async (req, res) => {
            const newProducts = req.body;
            const result = await productsCollection.insertOne(newProducts);
            res.send(result);
        })


        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        })

        app.get("/myProducts", async (req, res) => {
            const email = req.query.email
            const result = await productsCollection.find({ "posted_by.email": email }).toArray();
            res.send(result)
        })

        app.get("/myRating", async (req, res) => {
            const email = req.query.email
            const result = await usersCollection.find({ "posted_by.email": email }).toArray();
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log('Pinged your deployment. you successfully connected to MongoDB!');

    }
    finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Smart server is running on port: ${port}`);
})