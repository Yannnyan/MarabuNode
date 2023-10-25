import { Outpoint } from "./Outpoint.js";

export class Input {
    outpoint: Outpoint;
    sig: string;
    constructor(outpoint: Outpoint, sig: string) {
        this.outpoint = outpoint;
        this.sig = sig;
    }

    static Parse(obj: any) : Input {
        var keys = Object.keys(obj)
        if(!keys.includes("sig") || typeof (obj["sig"]) !== "string")
            throw new Error("Cannot parse Input, sig not found");
        if(!keys.includes("outpoint"))
            throw new Error("Cannot parse Input, outpoint not found");
        var sig = obj["sig"];
        var outpoint = Outpoint.Parse(obj["outpoint"]);
        return new Input(outpoint, sig);
    }
    ToDict() {
        return {
            "outpoint": this.outpoint,
            "sig": this.sig
        }
    }
}
