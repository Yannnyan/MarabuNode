import { Block } from "../../Models/Block.js";
import { container } from "../../Services/NodeContainerService.js";
import { MiningStrategy } from "./MiningStrategy.js";

export class ClassicMiningStrategy extends MiningStrategy{
    async Mine(): Promise<Block> {
        return new Promise((resolve, reject) => {
            var nonce: BigInt | undefined = undefined;
            var chainTip: Block | undefined;
            var previd: string | undefined;
            var b: Block;
            do {
                chainTip = container[this.myAddress.toString()].chainProvider.GetLongestChainTip();
                previd = chainTip ? chainTip.GetID() : undefined;
                nonce = nonce ? BigInt(("0x" + nonce) + BigInt("0x1")) : BigInt("0x0"); 
                if(!previd) throw (new Error("previd is not found"));
                b = this.blockTemplate.CreateBlock(nonce.toString(16),previd);
            }
            while(b.GetID() > this.blockTemplate.T);
            resolve(b);
        });
    }
    
}