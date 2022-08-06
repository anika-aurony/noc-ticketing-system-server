const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4oi5z.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('noc_ticketing_system').collection('tickets');
        console.log('DB connected')

        app.get('/ticket', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const tickets = await cursor.toArray();
            res.send(tickets)
        });

        app.post('/ticket', async (req, res) => {
            const newTicket = req.body;
            const result = await serviceCollection.insertOne(newTicket);
            res.send(result);

        });
    }
    finally {

    }
}

run().catch(console.dir);

app.post('/complain', (req, res) => {
    console.log('request', req.body)
    const complain = req.body;
    // complain.id = complain.lenght;
    // complains.push(complain);
    res.send();
})
app.get('/', (req, res) => {
    res.send('Hello NOC ticket')
});

app.listen(port, () => {
    console.log('Listening to port', port)
});