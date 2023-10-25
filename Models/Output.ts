
export class Output {
    pubkey: string;
    value: number;

    constructor(pubkey: string, value: number) {
        this.pubkey = pubkey;
        this.value = value;
    }

    static Parse(obj: any): Output {
        var keys = Object.keys(obj);
        if(!keys.includes("pubkey") || typeof(obj["pubkey"]) !== "string")
            throw new Error("Could not parse Output, pubkey not found");
        if (!keys.includes("value") || !Number.isInteger(obj["value"]))
            throw new Error("Could not parse Output, value not found");        
        return new Output(obj["pubkey"], obj["value"]);
    }
    ToDict() {
        return {
            "pubkey": this.pubkey,
            "value": this.value
        }
    }
}