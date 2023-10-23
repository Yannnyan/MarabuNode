import mongoose from "mongoose";

var tx = new mongoose.Schema({
    "type": String,
    inputs: [{"txid": String, "index": Number},{"sig": String}],
    outputs: [{"pubkey": String, "value": Number}]
});

mongoose.model("Transaction", tx);