import { randomBytes } from "crypto";
import { Block } from "../../Models/Block.js";
import { container } from "../../Services/NodeContainerService.js";
import { MiningStrategy } from "./MiningStrategy.js";
import { Address } from "../../Models/Address.js";
import { BlockTemplate } from "../../Models/BlockTemplate.js";



export class ClassicMiningStrategy extends MiningStrategy{
    txids: Set<string>;
    constructor(address: Address, blocktemplate: BlockTemplate, txids: Set<string>) {
        super(address,blocktemplate);
        this.txids = txids;
    }

    UpdateTxids(txids: Set<string>) {
        this.txids = txids;
    }
    async Mine(): Promise<Block> {
            var nonce: string;
            var previd: string | undefined;
            var b: Block;
            do {
                console.log(container);
                previd = this.blockTemplate.previd;
                nonce = randomBytes(32).toString("hex");
                if(!previd) throw (new Error("previd is not found"));
                b = await this.blockTemplate.CreateBlock(nonce,previd, this.txids);
            }
            while(b.GetID() > this.blockTemplate.T);
            return b;
    }
}