import mongoose from 'mongoose'

var BlockSchema = new mongoose.Schema({
    "type": String,
    "txids": [String],
    "nonce": String,
    "previd": String,
    "created": Number,
    "T": String,
    "miner": String,
    "note": String
});

mongoose.model("Block", BlockSchema);