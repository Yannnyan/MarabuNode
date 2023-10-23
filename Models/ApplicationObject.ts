import { Transaction } from "./Transaction";
import { Block } from "./Block";
import sha256, {Hash, HMAC} from "fast-sha256"
import canonicalize from "canonicalize"
import mongoose from "mongoose";

// const BlockModel = mongoose.model("Block");
// const TxModel = mongoose.model("Transaction");
// const CbTxModel = mongoose.model("CoinbaseTransaction"); 
const ObjModel = mongoose.model("ApplicationObject");

export class ApplicationObject {
    type: string;
    object: Block | Transaction;

    constructor(object: Block | Transaction) {
        this.type = typeof (object);
        this.object = object;
    }

    ParseObject(msg: any): ApplicationObject {
        var keys = Object.keys(msg);
        if(keys.indexOf("object") === -1)
            throw new Error("cannot parse object, it doesnt contain a keys key");
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

    ToDict() {
        return {
            "type" : "object",
            "object": this.object.ToDict()
        }
    }

    GetID() {
        var enc = new TextEncoder();
        return Buffer.from(sha256(enc.encode(canonicalize(this.ToDict())))).toString("hex");
    }

    ToString() {
        return canonicalize(this.ToDict())
    }

    async Save() {
        var obj = this.ToDict();
        await ObjModel.create({"object": obj.object, "objectid": this.GetID()})
    }
    
    static async FindById(id: String) {
        return ObjModel.findOne({"objectid": id});
    }
}




