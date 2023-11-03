import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";
import Sha256, {Hash, HMAC} from "fast-sha256"
import serialize from "canonicalize"
import bigInt from "big-integer";
import { container } from "../Services/NodeContainerService.js";
import { Address } from "./Address.js";
import { BlockVerifyRequest } from "../Strategies/RequestStrategies/BlockVerifyRequest.js";
import { Transaction } from "./Transaction.js";
import { Input } from "./Input.js";


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
var BLOCKREWARD = 50 * 1e+12

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
            if (objKeys.indexOf(key) === -1) {
                console.log("Couldn't find key " + key + " in object")
                throw new Error("Couldn't find key " + key + " in object");
            }
        });
        objKeys.forEach((key) => {
            if (blockKeys.indexOf(key) === -1) {
                throw new Error("Couldn't find key " + key + " in valid blockKeys");
            }});
        return new Block(obj["txids"], obj["nonce"], obj["previd"], obj["created"], 
                                        obj["T"], obj["miner"], obj["note"], myAddress);
    }

    async Verify(): Promise<boolean> {
        var appObj: ApplicationObjectDB = container[this.myAddress.toString()].DBConProvider.appObj
        // check proof of work
        var idValue = bigInt(this.GetID(), 16)
        var t = bigInt(this.T, 16);
        var missingTxids = []
        var foundTx = []
        var allTransactions: Transaction[] = []
        // check the txids of the block
        for(let txid of this.txids) {
            let obj = await appObj.FindById(txid)
            if(! obj) missingTxids.push(txid);
            else foundTx.push(obj);
        }
        // Add reqeust to recieve all transactions to pending requests manager
        if (missingTxids.length > 0){
            container[this.myAddress.toString()].pendingRequestProvider.AddRequest(new BlockVerifyRequest(this,missingTxids,this.myAddress));
            return false;
        }
        // check valid target
        if (this.T !== target) throw new Error("T does not equal target");
        if (idValue >= t) throw new Error("Proof of work is not valid, block ---> `id >= target`");
        // check all transactions of the block are Verified
        foundTx.forEach(async (transaction) => {
            if (!(transaction.object instanceof Transaction)) throw new Error("Block is invalid since one transaction id isn't a transaction " + transaction.GetID());
            if (!(await transaction.object.Verify(appObj))) throw new Error("Transaction " + transaction.GetID() +" is not verified");
            allTransactions.push(transaction.object);
        });
        // check that the block has only one coinbase transaction  
        var coinbaseTxs: Transaction[] = allTransactions.filter((tx) => tx.isCoinbase())
        var nonCoinbaseTxs: Transaction[] = allTransactions.filter((tx) => !tx.isCoinbase())
        if(coinbaseTxs.length > 1) throw new Error("Block contains more than one coinbase transactions.");
        if(coinbaseTxs.length === 1){
            // check the coinbase transaction is at index 0
            let matchingInputsTxs: [Transaction, number][] = []
            if (this.txids[0] !== coinbaseTxs[0].GetID()) throw new Error("Block contains a coin base transaction that is not at index 0.");
            let coinbaseTx = coinbaseTxs[0];
            // Forall Transactions Forall Inputs [ Input.outpoint.id !== coinbaseTx.id]
            var goodInputPredicate = function(input: Input){
                return input.outpoint.txid !== coinbaseTx.GetID()
            }
            var goodTxPredicate = function(tx: Transaction) {
                return tx.inputs.every((input) => goodInputPredicate(input)); 
            }
            // if exists tx with bad input
            if(!allTransactions.every(goodTxPredicate)) throw new Error("Block contains a transaction that has a newly generated coinbase transaction.");
            // Check the coinbase value is not more than fees + block reward
            // get all transactions of inputs outpoint
            for(let tx of nonCoinbaseTxs) {
                for(let i = 0; i < tx.inputs.length; i++){
                    let input = tx.inputs[i];
                    var found = (await appObj.FindById(input.outpoint.txid))?.object;
                    if(! found || found instanceof Block){
                        throw new Error("One input of transaction is a block or it is not found");
                    }
                    matchingInputsTxs.push([found, input.outpoint.index]);
                }
            }
            let input_sum = matchingInputsTxs.reduce(function(prev: number, cur){
                return prev + cur[0].outputs[cur[1]].value;
            }, 0);
            let output_sum = nonCoinbaseTxs.reduce(function(prev: number, cur){
                return prev + cur.outputs.reduce(function(c:number, p){
                    return c + p.value;
                },0);
            },0);
            let fees = input_sum - output_sum; // fees are positive here
            if(fees + BLOCKREWARD < coinbaseTx.outputs[0].value) throw new Error("Coinbase transaction reward is more than BLOCKREWARD + fees");   
        }
        else throw new Error("No coinbase transactions in the block.");
        return true;
    }

    GetID() {
        if (this.id === undefined){
            var d = this.ToDict()
            var can = canonicalize(d)
            var uint8 = Buffer.from(can);
            var hash = sha256(uint8)
            this.id = Buffer.from(hash).toString("hex");
        }
        return this.id;
    }

    ToDict() {
        return {
            "type": "block",
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

