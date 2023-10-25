
export class Outpoint {
    txid: string;
    index: number;
    constructor(txid: string, index: number) {
        this.index = index;
        this.txid = txid;
    }

    static Parse(obj: any): Outpoint {
        var keys = Object.keys(obj);
        if(!keys.includes("txid") || typeof(obj["txid"]) !== "string")
            throw new Error("Could not parse Outpoint, txid not found");
        if (!keys.includes("index") || !Number.isInteger(obj["index"]))
            throw new Error("Could not parse Outpoint, index not found");        
        return new Outpoint(obj["txid"], obj["index"]);
    }
    ToDict() {
        return {
            "txid": this.txid,
            "index": this.index
        }
    }
}