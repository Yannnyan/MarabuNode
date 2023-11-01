import { Transaction } from "./Transaction.js";
import { Block } from "./Block.js";
import Sha256, {Hash, HMAC} from "fast-sha256"
import serialize from "canonicalize"
import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";


var sha256 = Sha256.hash
var canonicalize = serialize


// const BlockModel = mongoose.model("Block");
// const TxModel = mongoose.model("Transaction");
// const CbTxModel = mongoose.model("CoinbaseTransaction");

export class ApplicationObject {
    type: string;
    object: Block | Transaction;
    id?: string;

    constructor(object: Block | Transaction) {
        this.type = typeof (object);
        this.object = object;
    }

    static Parse(msg: any): ApplicationObject {
        var keys = Object.keys(msg);
        if(keys.indexOf("object") === -1)
            throw new Error("cannot parse object, it doesnt contain an object key " + JSON.stringify(msg) );
        var obj = msg["object"]
        var objKeys = Object.keys(obj);
        if (objKeys.indexOf("type") === -1){
            throw new Error("cannot parse object, it doesnt contain a type key");
        }
        if (obj["type"] === "block"){
            var block = Block.Parse(obj);
            return new ApplicationObject(block);
        }
        else if(obj["type"] === "transaction") {
            var transaction = Transaction.Parse(obj);
            return new ApplicationObject(transaction);
        }
        else {
            throw new Error("unrecognized object type")
        }
    }

    async Verify(appObj: ApplicationObjectDB) {
        await this.object.Verify(appObj);
    }

    ToDict() {
        return {
            "type" : "object",
            "object": this.object.ToDict()
        }
    }

    GetID() {
        if (this.id === undefined){
            var enc = new TextEncoder();
            var uint8 = Buffer.from(canonicalize(this.object.ToDict()));
            this.id = Buffer.from(sha256(uint8)).toString("hex");    
        }
        return this.id;
    }

    ToString() {
        return canonicalize(this.ToDict())
    }

}




