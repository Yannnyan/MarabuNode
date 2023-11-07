import { container } from "../Services/NodeContainerService.js";
import { Address } from "./Address.js";
import { Block } from "./Block.js";


export class BlockTemplate {
    created: number;
    T: string;
    miner: string;
    note: string;
    myAddress: Address;
    maxTxs: number;

    constructor(myAddress:Address, note:string, miner: string, created: number, T: string, maxTxs: number) {
        this.created = created;
        this.miner = miner;
        this.note = note;
        this.maxTxs = maxTxs;
        this.T = T;
        this.myAddress = myAddress;
    }

    CreateBlock(nonce: string, previd: string) : Block {
        var txids: string[] = container[this.myAddress.toString()].utxoSetProvider.GetUtxoSet().map((utxo) => utxo.GetID());
        var pickedTxids = txids.splice(0,this.maxTxs); 
        return new Block(pickedTxids, nonce, previd, this.created, this.T, this.miner,this.note, this.myAddress)
    }
}










