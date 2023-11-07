import { Address } from "../Models/Address.js";
import { Block } from "../Models/Block.js";
import { Transaction } from "../Models/Transaction.js";
import { container } from "./NodeContainerService.js";
import EVENTS from '../Events/events.json' assert { type: "json" };



export class MempoolManager {
    txs: Map<string, Transaction>
    myAddress: Address;

    constructor(myAddress: Address) {
        this.txs = new Map();
        this.myAddress = myAddress;
        // var db = container[myAddress.toString()].DBConProvider.appObj;
        // container[this.myAddress.toString()].eventEmitter.addListener(EVENTS["CHAINTIP_UPDATE"], async () => {
        //     var tip = container[this.myAddress.toString()].chainProvider.GetLongestChainTip();
        //     if(!tip) throw new Error("undefined tip");
        //     for(let txid of tip?.txids) {
        //         var trans = await db.FindById(txid);
        //         if(!trans) throw new Error("trans cant be found");
        //         if(trans.object instanceof Block) throw new Error("found block instead of transaction");
        //         this.SetTransaction(trans.object);
        //     }
        // })
    }

    /**
     * Puts the transaction in the map of pending transactions.
     * @param tx Assumes tx is verified 
     */
    SetTransaction(tx: Transaction) {
        if(!this.txs.get(tx.GetID()))  this.txs.set(tx.GetID(), tx);
    }
    /**
     * 
     * @param block Assumes block is verified
     */
    ApplyBlock(block: Block) { 
        for(let tx of block.txids) {
            this.txs.delete(tx);
        }
    }
}





