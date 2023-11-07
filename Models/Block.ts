import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";
import Sha256, {Hash, HMAC} from "fast-sha256"
import serialize from "canonicalize"
import bigInt from "big-integer";
import { container } from "../Services/NodeContainerService.js";
import { Address } from "./Address.js";
import { GetObjectsRequest } from "../Strategies/RequestStrategies/GetObjectsRequest.js";
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
    height?: number;


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

    async #GetAllTransactions(txids: string[]): Promise<Transaction[]> {
        var appObj: ApplicationObjectDB = container[this.myAddress.toString()].DBConProvider.appObj
        var missingTxids: string[] = txids.slice();
        var foundTx: Transaction[] = []

        missingTxids.filter(async (txid) => {
            var obj = await appObj.FindById(txid);
            if(! obj){
                missingTxids.push(txid);
                return true;
            }
            if(obj.object instanceof Block) throw new Error("UNFINDABLE_OBJECT")
            else{
                foundTx.push(obj.object);
                return false;
            }
        });
        var objs = (await (new GetObjectsRequest(missingTxids,this.myAddress)).HandleRequest())
        var txs = objs.map((obj) => {
            if(obj.object instanceof Block){
                throw new Error("obj.object is a block not a transaction.");
            }
            return obj.object;
        })
        txs.push(...foundTx);
        return txs;
    }


    #CheckProofOfWork() {
        var idValue = bigInt(this.GetID(), 16)
        var t = bigInt(this.T, 16);
        // check valid target
        if (this.T !== target) throw new Error("T does not equal target");
        if (idValue >= t) throw new Error("Proof of work is not valid, block ---> `id >= target`");
    }

    async #CheckCoinbase(coinbaseTx: Transaction, allTransactions: Transaction[], nonCoinbaseTxs: Transaction[]) {
        // check the coinbase transaction is at index 0
        let matchingInputsTxids: [string, number][] = []
        let matchingInputsTxs: [Transaction, number][] = []
        if (this.txids[0] !== coinbaseTx.GetID()) throw new Error("Block contains a coin base transaction that is not at index 0.");
        // Forall Transactions Forall Inputs [ Input.outpoint.id !== coinbaseTx.id]
        var goodInputPredicate = (input: Input) => input.outpoint.txid !== coinbaseTx.GetID();
        var goodTxPredicate = (tx: Transaction) => tx.inputs.every((input) => goodInputPredicate(input)); 
        
        // if exists tx with bad input
        if(!allTransactions.every(goodTxPredicate)) throw new Error("Block contains a transaction that has a newly generated coinbase transaction.");
        // Check the coinbase value is not more than fees + block reward
        // get all transactions of inputs outpoint
        for(let tx of nonCoinbaseTxs)
            for(let input of tx.inputs)
                matchingInputsTxids.push([input.outpoint.txid, input.outpoint.index]);
        
        var matchingTxs = await this.#GetAllTransactions(matchingInputsTxids.map((mat) => mat[0]));
        matchingInputsTxids.forEach(ar => {
            var obj = matchingTxs.find((tx) => tx.GetID() === ar[0]);
            if(!obj) throw new Error("transaction is undefined");
            matchingInputsTxs.push([obj, ar[1]]);
        });
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

    async #GetAllPreviousBlocks() {
        var ancestors: Block[] =[this] 
        var parentId = this.previd;
        while(parentId !== null) {
            var parentObj = (await new GetObjectsRequest([parentId], this.myAddress).HandleRequest());
            if(!parentObj || parentObj.length === 0) throw new Error("UNFINDABLE_OBJECT");
            var block = parentObj[0].object
            if(block instanceof Transaction) throw new Error("Found Transaction instead of a block in prev id, block is invalid.");
            ancestors.push(block);
            parentId = block.previd;
        }
        if(!this.height){
            this.height = ancestors.length - 1;
        }
        return ancestors;
    }

    #CheckMinerNote() {
        var reg = /^[\x00-\x7F]*$/;
        if(!(this.note.length > 128 || this.miner.length > 128)) throw new Error("INVALID_FORMAT"); // miner or note length is mor ethan 128 bytes long
        if(!(reg.test(this.note) || reg.test(this.miner))) throw new Error("INVALID_FORMAT"); //miner or note is not ascii printable

    }

    async VerifyOneBlock(height: number): Promise<boolean> {
        var appObj: ApplicationObjectDB = container[this.myAddress.toString()].DBConProvider.appObj
        // check proof of work
        this.#CheckProofOfWork();
        // CHECK MINER NOTE ASCII < 128
        this.#CheckMinerNote();
        // check all transactions of the block are Verified
        var allTransactions: Transaction[] = await this.#GetAllTransactions(this.txids);
        allTransactions.forEach(async (transaction) => {
            if (!(await transaction.Verify(appObj))) throw new Error("Transaction " + transaction.GetID() +" is not verified");
        });
        // check that the block has only one coinbase transaction  
        var coinbaseTxs: Transaction[] = allTransactions.filter((tx) => tx.isCoinbase())
        var nonCoinbaseTxs: Transaction[] = allTransactions.filter((tx) => !tx.isCoinbase())
        if(coinbaseTxs.length > 1) throw new Error("Block contains more than one coinbase transactions.");
        if(coinbaseTxs.length === 1){
            let coinbaseTx = coinbaseTxs[0];
            if(!(coinbaseTx.height === height)) throw new Error("INVALID_BLOCK_COINBASE")
            await this.#CheckCoinbase(coinbaseTx, allTransactions, nonCoinbaseTxs);
        }
        else throw new Error("No coinbase transactions in the block.");
        return true;
    }

    async Verify(): Promise<boolean> {
        var ancestors = (await this.#GetAllPreviousBlocks()).reverse();
        for(let height = 0; height < ancestors.length; height++) {
            var curBlock = ancestors[ancestors.length - 1 - height];
            var parentBlock: Block | undefined = height > 0 ? ancestors[ancestors.length - 2 - height] : undefined;
            if(parentBlock && ! (curBlock.created - parentBlock?.created < 0)) throw new Error("INVALID_BLOCK_TIMESTAMP");
            if(curBlock.created > Date.now()) throw new Error("INVALID_BLOCK_TIMESTAMP");
            await curBlock.VerifyOneBlock(height);
        }
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

