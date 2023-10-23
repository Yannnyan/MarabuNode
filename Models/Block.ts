

var blockDict = {"type": String,
"txids": [String],
"nonce": String,
"previd": String,
"created": Number,
"T": String,
"miner": String,
"note": String}

export class Block {
    txids: string[];
    nonce: string;
    previd: string;
    created: number;
    T: string;
    miner: string;
    note: string;

    constructor(txids: string[], nonce: string, previd: string, created: number, T: string, miner: string, note:string) {
        this.txids = txids;
        this.nonce = nonce;
        this.previd = previd;
        this.created = created;
        this.T = T;
        this.miner = miner;
        this.note = note;
    }

    static Parse(obj: any) :Block {
        var blockKeys = Object.keys(blockDict);
        var objKeys = Object.keys(obj);

        blockKeys.forEach(function (key){
            if (objKeys.indexOf(key) !== -1) {
                throw new Error("Couldn't find key " + key + " in object");
            }
        });
        objKeys.forEach((key) => {
            if (blockKeys.indexOf(key) !== -1) {
                throw new Error("Couldn't find key " + key + " in valid blockKeys");
            }});
        return new Block(obj["txids"], obj["nonce"], obj["previd"], obj["created"], 
                                        obj["T"], obj["miner"], obj["note"])
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
        }
    }

}

