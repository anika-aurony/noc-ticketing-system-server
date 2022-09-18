const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4oi5z.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

var emailSenderOptions = {
    auth: {
        api_key: process.env.EMAIL_SENDER_KEY
    }
}

const emailClient = nodemailer.createTransport(sgTransport(emailSenderOptions));

function sendTicketEmail(newTicket) {
    const { name, type, complain, status, assign, ETR, complainEmail } = newTicket;

    var email = {
        from: process.env.EMAIL_SENDER,
        to: complainEmail,
        subject: `New ticket created of ${name} is assign to ${assign} `,
        text: `New ticket created of ${name} is assign to ${assign} `,
        html: `
            <div>
                <p>Dear concern,</p>
                <p>A new complain has arrived</p>
                <p>${name} complain on ${type} has a ETR of ${ETR}.</p>
                <p>Status is ${status}</p>
                <p>${complain}</p>
            </div>`

    };

    emailClient.sendMail(email, function(err, info){
        if (err ){
          console.log(err);
        }
        else {
          console.log('Message sent: ', info);
        }
    });

    

}

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
            sendTicketEmail(newTicket);
            res.send(result);

        });

        app.put('/ticket/:id', async (req, res) => {
            const id = req.params.id;
            const updateComplain = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateComplain.status,
                    assign: updateComplain.assign,
                    ETR: updateComplain.ETR
                }
            }
            const result = await serviceCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

// app.post('/complain', (req, res) => {
//     console.log('request', req.body)
//     const complain = req.body;
//     // complain.id = complain.lenght;
//     // complains.push(complain);
//     res.send();
// })
app.get('/', (req, res) => {
    res.send('Hello NOC ticket')
});

app.listen(port, () => {
    console.log('Listening to port', port)
});