import { Address } from "./Address.js";
import { Block } from "./Block.js";


export class BlockTemplate {
    T: string;
    miner: string;
    note: string;
    myAddress: Address;
    maxTxs: number;
    pickedTxids: string[];
    previd: string;


    constructor(myAddress:Address, note:string, miner: string, T: string, maxTxs: number, previd: string) {
        this.miner = miner;
        this.note = note;
        this.maxTxs = maxTxs;
        this.T = T;
        this.myAddress = myAddress;
        this.pickedTxids = [];
        this.previd = previd;
    }

    async CreateBlock(nonce: string, previd: string, txids: Set<string>) : Promise<Block> {
        this.pickedTxids = [...txids].slice(0,this.maxTxs);
        return new Block(this.pickedTxids, nonce, previd, Date.now(), this.T, this.miner,this.note, this.myAddress)
    }
}
