import { EventEmitter } from "events";
import { Address } from "../Models/Address.js";
import { container } from "./NodeContainerService.js";

import EVENTS from '../Events/Events.json' assert {type: "json"};
import { Block } from "../Models/Block.js";
import { ApplicationObject } from "../Models/ApplicationObject.js";

export class EventManager {
    myAddress: Address;
    eventEmitter : EventEmitter;
    constructor(myAddress : Address) {
        this.myAddress = myAddress;
        this.eventEmitter = container[myAddress.toString()].eventEmitter;
        this.eventEmitter.addListener(EVENTS.BLOCK_MINED, async (block: Block) => {
            console.log(EVENTS.BLOCK_MINED);
            await block.Verify();
            await container[myAddress.toString()].DBConProvider.appObj.Save(new ApplicationObject(block));
            await container[myAddress.toString()].utxoSetProvider.ComputeUTXOSet(block);
            await container[myAddress.toString()].mempoolProvider.ApplyBlock(block);
            await container[myAddress.toString()].chainProvider.UpdateTip(block.GetID());
        }); 

    }  



}








