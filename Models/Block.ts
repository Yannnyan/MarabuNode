import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";
import Sha256, {Hash, HMAC} from "fast-sha256"
import serialize from "canonicalize"
import bigInt from "big-integer";
import { container } from "../Services/NodeContainerService.js";
import { Address } from "./Address.js";
import { BlockVerifyRequest } from "../Strategies/RequestStrategies/BlockVerifyRequest.js";
import { Transaction } from "./Transaction.js";


var sha256 = Sha256.hash
var canonicalize = serialize


var blockDict = {"type": String,
"txids": [String],
"nonce": String,
"previd": String,
"created": Number,
"T": String,
"miner": String,
"note": String}

var target = "00000002af000000000000000000000000000000000000000000000000000000";

export class Block {
    type= "block"
    txids: string[];
    nonce: string;
    previd: string;
    created: number;
    T: string;
    miner: string;
    note: string;
    myAddress: Address;
    id?: string;


    constructor(txids: string[], nonce: string, previd: string,
         created: number, T: string, miner: string, note:string,
         myAddress: Address) {
        this.txids = txids;
        this.nonce = nonce;
        this.previd = previd;
        this.created = created;
        this.T = T;
        this.miner = miner;
        this.note = note;
        this.myAddress = myAddress;
    }

    static Parse(obj: any, myAddress: Address) :Block {
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
                                        obj["T"], obj["miner"], obj["note"], myAddress);
    }

    async Verify(): Promise<boolean> {
        var appObj: ApplicationObjectDB = container[this.myAddress.toString()].DBConProvider.appObj
        // check valid target
        if (this.T !== target){
            throw new Error("T does not equal target");
        }
        // check proof of work
        var idValue = bigInt(this.GetID(), 16)
        var t = bigInt(this.T, 16);
        if (idValue >= t){
            throw new Error("Proof of work is not valid, block ---> `id >= target`");
        }
        // check the txids of the block
        var missingTxids = []
        var foundTx = []
        for(let txid of this.txids) {
            let obj = await appObj.FindById(txid)
            if(! obj){
                missingTxids.push(txid);
            }
            else
                foundTx.push(obj);
        }
        // Add reqeust to recieve all transactions to pending requests manager
        if (missingTxids.length > 0){
            container[this.myAddress.toString()].pendingRequestProvider.AddRequest(new BlockVerifyRequest(this,missingTxids,this.myAddress));
            return false;
        }
        foundTx.forEach(async (transaction) => {
            if (!(transaction.object instanceof Transaction)){
                throw new Error("Block is invalid since one transaction id isn't a transaction " + transaction.GetID());
            }
            if (!(await transaction.object.Verify(appObj))) {
                throw new Error("Transaction " + transaction.GetID() +" is not verified");
            }
        });  
        var coinbaseTxs = foundTx.filter((transaction) => transaction.object instanceof Transaction && 
                                    transaction.object.isCoinbase()) 
        if(coinbaseTxs.length > 1) {
            throw new Error("Block contains more than one coinbase transactions.");
        }
        if(coinbaseTxs.length === 1){
            if (this.txids[0] !== coinbaseTxs[0].GetID()){
                throw new Error("Block contains a coin base transaction that is not at index 0.");
            }
            let coinbaseTx = coinbaseTxs[0];
            if(foundTx.findIndex(
                (tx) => tx instanceof Transaction && 
                        (tx.inputs.findIndex(
                            (input) => input.outpoint.txid !== coinbaseTx.GetID())) !== -1) !== -1){
                throw new Error("Block contains a transaction that has a newly generated coinbase transaction.");
            }
        }
        


    }

    GetID() {
        if (this.id === undefined){
            var uint8 = Buffer.from(canonicalize(this.ToDict()));
            this.id = Buffer.from(sha256(uint8)).toString("hex");    
        }
        return this.id;
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

