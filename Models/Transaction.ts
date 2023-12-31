
import { ApplicationObject } from "./ApplicationObject.js";
import * as ed from "@noble/ed25519"
import { sha512 } from "@noble/hashes/sha512";
import { Block } from "./Block.js";
import Sha256, {Hash, HMAC} from "fast-sha256"
import serialize from "canonicalize"
import { Input } from "./Input.js";
import { Output } from "./Output.js";
import { ApplicationObjectDB } from "../DB/ApplicationObject.db.js";


ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

var sha256 = Sha256.hash
var canonicalize = serialize


export class Transaction {
    type = "transaction";
    inputs: Input[];
    outputs: Output[];
    coinbase: boolean;
    height?: number;
    id?: string;

    constructor(outputs: Output[], inputs: Input[], coinbase?: boolean, height?: number) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.coinbase = coinbase || false;
        if (this.coinbase === true && height === undefined){
            throw new Error("Cannot create coinbase transaction without height")
        }
        this.height = height;
    }

    static CreateTransaction(outputs: Output[], inputs: Input[]) {
        return new Transaction(outputs, inputs);
    }
    static CreateCoinbaseTransaction(outputs: Output[], height: number): Transaction {
        return new Transaction(outputs,[],true, height);
    }
    static Parse(obj: any) {
        var objKeys = Object.keys(obj);
        if(objKeys.includes("inputs") && objKeys.includes("outputs")) {
            if(!Array.isArray(obj["inputs"]))
                throw new Error("Could not parse, inputs is not an Array");
            else if(!Array.isArray(obj["outputs"]))
                throw new Error("Could not parse, outputs is not an Array");
            var inputs = obj["inputs"].map((input) => Input.Parse(input))
            var outputs = obj["outputs"].map((output) => Output.Parse(output));
            return Transaction.CreateTransaction(outputs, inputs);
        }
        else if(objKeys.includes("outputs") && objKeys.includes("height")) {
            if(!Array.isArray(obj["outputs"]))
                throw new Error("Could not parse, outputs is not an Array");
            if(!Number.isInteger(obj["height"]))
                throw new Error("Could not parse, height is not an integer");
            var outputs = obj["outputs"].map((output) => Output.Parse(output));
            var height = obj["height"];
            return Transaction.CreateCoinbaseTransaction(outputs, height);
        }
        else {
            throw new Error("Could not match transaction.")
        }
        
    }
    GetID() {
        if (this.id === undefined){
            var uint8 = Buffer.from(canonicalize(this.ToDict()));
            this.id = Buffer.from(sha256(uint8)).toString("hex");    
        }
        return this.id;
    }

    GetNoSig() {
        if (this.coinbase)
            return undefined;
        var d = this.ToDict()
        var inputs = d.inputs?.map((input) => {
            return {"outpoint": input.outpoint,"sig": null}
        });
        return {"outputs": d.outputs, "inputs": inputs, "type":d.type}
    }

    async Verify(appObjDB: ApplicationObjectDB): Promise<boolean> {
        var matchingOutputs: [Transaction, number][] = []
        var nosigTx = this.GetNoSig()

        for(let input of this.inputs){
            var out: ApplicationObject | null | undefined = (await appObjDB.FindById(input.outpoint.txid))
            if (! out) throw new Error("Outpoint of Transaction Couldn't be found. ")
            var matchingOutputTx: Transaction | Block = out.object
            console.log("obj" + matchingOutputTx)
            if(matchingOutputTx instanceof Block) throw new Error("Object with id " + input.outpoint.txid + " is not a transaction.");
            matchingOutputs.push([matchingOutputTx, input.outpoint.index]);
            if(matchingOutputTx.outputs.length < input.outpoint.index) throw new Error("outputs length is smaller then outpoint index " + input.outpoint.index.toString());
            var uint8Sig = Uint8Array.from(Buffer.from(input.sig, "hex")) // conv hex to uint8
            var uint8Pubkey = Uint8Array.from(Buffer.from(matchingOutputTx.outputs[input.outpoint.index]["pubkey"], 'hex'))  // conv hex to uint8
            var uint8Msg = (Buffer.from(canonicalize(nosigTx))) // conv hex to uint8
            if(!ed.verify(uint8Sig,uint8Msg,uint8Pubkey)) throw new Error("ed verification didn't check out.");
            var sameOp = this.inputs.filter((inp) => inp.outpoint.index === input.outpoint.index && inp.outpoint.txid === input.outpoint.txid);
            if(sameOp.length >=2) throw new Error("transaction contains two matching outputs");
        }
        for (let output of this.outputs) {
            if(output.pubkey.length !== 64) { // check valid
                throw new Error("Output public key length is " + output.pubkey.length.toString() + " instead of 64");
            }
            if(output.value < 0 || !Number.isInteger(output.value)) {
                throw new Error("output value is negative or not an integer.");
            }
        }
        if (this.coinbase)
        {
            if (this.inputs.length !== 0 || this.outputs.length !== 1)
                throw new Error("Coinbase transaction input length is not 0, or output length is not 1");
            if (this.height && this.height < 0)
                throw new Error("height cannot be less than 0.");
            return true;

        }
        var sum_inputs:number = matchingOutputs.reduce(function (prev, cur) {
            return prev + cur[0].outputs[cur[1]].value;
        },0)
        
        var sum_outputs:number = this.outputs.reduce(function(prevValue: number, curElement) {
            return prevValue + curElement.value;
        },0);
        if (sum_outputs > sum_inputs) {
            throw new Error("Sum of the input values " + sum_inputs.toString() + " is less than the sum of the output values " + sum_outputs.toString());
        }
        return true;
    }

    GetOutputSum(): number {
        return this.outputs.reduce(function(prev: number, cur: Output){
            return prev + cur.value;
        }, 0);
    }

    CheckUTXO() : boolean {
        return this.GetOutputSum() === 0;
    }


    ToDict() {
        if(!this.coinbase)
            return {
                "type": "transaction",
                "inputs": this.inputs.map((input) => input.ToDict()),
                "outputs": this.outputs.map((output) => output.ToDict())
            }
        else 
            return {
                "type": "transaction",
                "height": this.height,
                "outputs": this.outputs.map((output) => output.ToDict())
            }
    }

    isCoinbase(): boolean {return this.coinbase}; 
    
}
