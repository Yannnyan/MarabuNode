import mongoose from "mongoose";

var cbTx = new mongoose.Schema({
    "type": String,
    "height": Number,
    "outputs": [{"pubkey": String, "value": Number}]
})

mongoose.model("CoinbaseTransaction", cbTx);

