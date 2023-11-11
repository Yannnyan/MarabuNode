import { Address } from "../Models/Address.js";
import { Block } from "../Models/Block.js";
import { Transaction } from "../Models/Transaction.js";
import { container } from "./NodeContainerService.js";
import EVENTS from '../Events/Events.json' assert { type: "json" };
import {Mutex} from "async-mutex";
import { IMempoolProvider } from "../API/Services/IMempoolProvider.js";



export class MempoolManager implements IMempoolProvider {
    txs: Set<string>
    myAddress: Address;
    mutex: Mutex;

    constructor(myAddress: Address) {
        this.myAddress = myAddress;
        this.txs = new Set();
        this.mutex = new Mutex();
    }

    /**
     * Puts the transaction in the map of pending transactions.
     * @param tx Assumes tx is verified 
     */
    async SetTransaction(tx: string): Promise<void> {
        const release = await this.mutex.acquire();
        if(!this.txs.has(tx))  this.txs.add(tx);
        release();
    }
    /**
     * 
     * @param block Assumes block is verified
     */
    async ApplyBlock(block: Block): Promise<void> {
        const release = await this.mutex.acquire(); 
        for(let tx of block.txids) {
            this.txs.delete(tx);
        }
        release();
    }

    async GetTxs() : Promise<Set<string>> {
        const release = await this.mutex.acquire();
        var txs = this.txs;
        release();
        return txs;
    }
}





