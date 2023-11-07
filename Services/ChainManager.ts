import { IChainProvider } from "../API/Services/IChainProvider.js";
import { Address } from "../Models/Address.js";
import { Block } from "../Models/Block.js";
import { Transaction } from "../Models/Transaction.js";
import { GetObjectsRequest } from "../Strategies/RequestStrategies/GetObjectsRequest.js";
import { container } from "./NodeContainerService.js";
import Events from "../Events/events.json"


export class ChainManager implements IChainProvider{
    longestChainTip?: Block;
    longestChainHeight: number;
    myAddress: Address

    constructor(myAddress: Address) {
        this.longestChainHeight = 0;
        this.myAddress = myAddress;
    }


    async UpdateTip(blockid: string) {
        await this.#TakeBlockId(blockid);
        container[this.myAddress.toString()].eventEmitter.emit(Events["CHAINTIP_UPDATE"]);
    }

    async #TakeBlockId(blockid: string) {
        var appObj = container[this.myAddress.toString()].DBConProvider.appObj;
        if(this.longestChainTip && this.longestChainTip.GetID() === blockid) return; 
        else{
            var obj = await appObj.FindById(blockid);
            if(obj){ // if we found it locally
                var block = obj.object;
                if(block instanceof Transaction) throw new Error("block found with blockid is a transaction");
                await this.#TakeBlock(block);
            }
            else { // cant find the block localy then request it from the network
                var netObjarr = await new GetObjectsRequest([blockid], this.myAddress).HandleRequest();
                if(netObjarr.length === 0) throw new Error("net object is 0 length");
                var netObj = netObjarr[0].object;
                if(netObj instanceof Transaction) throw new Error("block found with blockid is a transaction");
                await this.#TakeBlock(netObj);
            }
        }
    }

    async #TakeBlock(newBlock: Block): Promise<void> {
        
        await newBlock.Verify();
        if(!newBlock.height) throw new Error("cannot determine block height");
        if(this.longestChainHeight < newBlock.height)
        {
            this.longestChainHeight = newBlock.height;
            this.longestChainTip = newBlock;
        }
    }
    
    GetLongestChainTip(): Block | undefined {
        return this.longestChainTip;
    }

    GetLongestChainHeight(): number {
        return this.longestChainHeight;
    }
    
}










