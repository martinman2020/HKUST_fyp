import express from "express";
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from "mongoose";

// The routes
import route_cards from './routes/cards.js'

const app = express();


app.use(bodyParser.json({ limit: "30mb", extended: 'ture' }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: 'ture' }));
app.use(cors());

app.use('/cards', route_cards);

const CONNECTION_URL = 'mongodb+srv://kiwi:Aa23982236*@flbuddybackend.exgd1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const PORT = process.env.PORT || 5100

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Service is running on port ${PORT}`)))
    .catch((err) => {
        console.log('Error : ', err.message)
    })

// depercated syntax
// mongoose.set('useFindAndModify', false)

