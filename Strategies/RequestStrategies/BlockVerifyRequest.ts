import { Block } from "../../Models/Block.js";
import { MsgStrategy } from "../MsgStrategies/MsgStrategy.js";
import { RequestStrategy } from "./RequestStrategy.js";
import { ObjectStrategy } from "../MsgStrategies/ObjectStrategy.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import { Address } from "../../Models/Address.js";
import { IPeerProvider } from "../../API/Services/IPeerProvider.js";
import { container } from "../../Services/NodeContainerService.js";
import { OpenConnection } from "../../Models/OpenConnection.js";

export class BlockVerifyRequest extends RequestStrategy {
    
    
    
    pendingTxids: string[];
    block: Block;
    myAddress: Address;


    constructor(block: Block, pendingTxids: string[], myAddress:Address) {
        super();
        this.block = block;
        this.pendingTxids = pendingTxids;
        this.myAddress = myAddress;
    }

    OnFullfilled(): void {
        this.block.Verify();
    }

    IsFullfilled(): boolean {
        if(this.pendingTxids.length === 0)
            return true;
        return false;
    }
    
    OnMsgStrategy(msgStrat: MsgStrategy): void {
        if(msgStrat instanceof ObjectStrategy) {
            let appObj = ApplicationObject.Parse(msgStrat.msg, this.myAddress);

            if(appObj.object.type === "transaction") {
                // check if we can remove it from pending Txids
                let appObjId = appObj.GetID();
                let i = this.pendingTxids.findIndex((id) => id === appObjId) 
                if (i !== -1){
                    this.pendingTxids.splice(i,1);
                }
            }
        }
    }
    HandleRequest(): void {
        var peerProvider: IPeerProvider = container[this.myAddress.toString()].peerProvider
        var openConnections: OpenConnection[] = peerProvider.GetOpenConnections()
        // send Get Object to the network
        for(let txid of this.pendingTxids) {
            for(let openCon of openConnections) {
                openCon.SendGetObject(txid);
            }
        }
    }

}




