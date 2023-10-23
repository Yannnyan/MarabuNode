"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.Output = exports.Outpoint = exports.Input = void 0;
class Input {
    constructor(outpoint, sig) {
        this.outpoint = outpoint;
        this.sig = sig;
    }
    static Parse(obj) {
        var keys = Object.keys(obj);
        if (!keys.includes("sig") || typeof (obj["sig"]) !== "string")
            throw new Error("Cannot parse Input, sig not found");
        if (!keys.includes("outpoint"))
            throw new Error("Cannot parse Input, outpoint not found");
        var sig = obj["sig"];
        var outpoint = Outpoint.Parse(obj);
        return new Input(outpoint, sig);
    }
    ToDict() {
        return {
            "outpoint": this.outpoint,
            "sig": this.sig
        };
    }
}
exports.Input = Input;
class Outpoint {
    constructor(txid, index) {
        this.index = index;
        this.txid = txid;
    }
    static Parse(obj) {
        var keys = Object.keys(obj);
        if (!keys.includes("txid") || typeof (obj["txid"]) !== "string")
            throw new Error("Could not parse Outpoint, txid not found");
        if (!keys.includes("index") || !Number.isInteger(obj["index"]))
            throw new Error("Could not parse Outpoint, index not found");
        return new Outpoint(obj["txid"], obj["index"]);
    }
    ToDict() {
        return {
            "txid": this.txid,
            "index": this.index
        };
    }
}
exports.Outpoint = Outpoint;
class Output {
    constructor(pubkey, value) {
        this.pubkey = pubkey;
        this.value = value;
    }
    static Parse(obj) {
        var keys = Object.keys(obj);
        if (!keys.includes("pubkey") || typeof (obj["pubkey"]) !== "string")
            throw new Error("Could not parse Output, pubkey not found");
        if (!keys.includes("value") || !Number.isInteger(obj["value"]))
            throw new Error("Could not parse Output, value not found");
        return new Output(obj["pubkey"], obj["value"]);
    }
    ToDict() {
        return {
            "pubkey": this.pubkey,
            "value": this.value
        };
    }
}
exports.Output = Output;
class Transaction {
    constructor(outputs, inputs, coinbase, height) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.coinbase = coinbase || false;
        if (this.coinbase === true && this.height === undefined) {
            throw new Error("Cannot create coinbase transaction without height");
        }
        this.height = height;
    }
    static CreateTransaction(outputs, inputs) {
        return new Transaction(outputs, inputs);
    }
    static CreateCoinbaseTransaction(outputs, height) {
        return new Transaction(outputs, [], true, height);
    }
    static Parse(obj) {
        var objKeys = Object.keys(obj);
        if (objKeys.includes("inputs") && objKeys.includes("outputs")) {
            if (!Array.isArray(obj["inputs"]))
                throw new Error("Could not parse, inputs is not an Array");
            else if (!Array.isArray(obj["outputs"]))
                throw new Error("Could not parse, outputs is not an Array");
            var inputs = obj["inputs"].map((input) => Input.Parse(input));
            var outputs = obj["outputs"].map((output) => Output.Parse(output));
            return Transaction.CreateTransaction(outputs, inputs);
        }
        else if (objKeys.includes("outputs") && objKeys.includes("height")) {
            if (!Array.isArray(obj["outputs"]))
                throw new Error("Could not parse, outputs is not an Array");
            if (!Number.isInteger(obj["height"]))
                throw new Error("Could not parse, height is not an integer");
            var outputs = obj["outputs"].map((output) => Output.Parse(output));
            var height = obj["height"];
            return Transaction.CreateCoinbaseTransaction(outputs, height);
        }
        else {
            throw new Error("Could not match transaction.");
        }
    }
    ToDict() {
        if (!this.coinbase)
            return {
                "type": "transaction",
                "inputs": this.inputs.map((input) => input.ToDict()),
                "outputs": this.outputs.map((output) => output.ToDict())
            };
        else
            return {
                "type": "transaction",
                "height": this.height,
                "outputs": this.outputs.map((output) => output.ToDict())
            };
    }
    isCoinbase() { return this.coinbase; }
    ;
}
exports.Transaction = Transaction;
