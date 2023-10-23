"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;
var blockDict = { "type": String,
    "txids": [String],
    "nonce": String,
    "previd": String,
    "created": Number,
    "T": String,
    "miner": String,
    "note": String };
class Block {
    constructor(txids, nonce, previd, created, T, miner, note) {
        this.txids = txids;
        this.nonce = nonce;
        this.previd = previd;
        this.created = created;
        this.T = T;
        this.miner = miner;
        this.note = note;
    }
    static Parse(obj) {
        var blockKeys = Object.keys(blockDict);
        var objKeys = Object.keys(obj);
        blockKeys.forEach(function (key) {
            if (objKeys.indexOf(key) !== -1) {
                throw new Error("Couldn't find key " + key + " in object");
            }
        });
        objKeys.forEach((key) => {
            if (blockKeys.indexOf(key) !== -1) {
                throw new Error("Couldn't find key " + key + " in valid blockKeys");
            }
        });
        return new Block(obj["txids"], obj["nonce"], obj["previd"], obj["created"], obj["T"], obj["miner"], obj["note"]);
    }
    ToDict() {
        return {
            "type": "Block",
            "txids": this.txids,
            "nonce": this.nonce,
            "previd": this.previd,
            "created": this.created,
            "T": this.T,
            "miner": this.miner,
            "note": this.note
        };
    }
}
exports.Block = Block;
