import { Block } from "../../Models/Block.js";
import { MsgStrategy } from "../MsgStrategies/MsgStrategy.js";
import { RequestStrategy } from "./RequestStrategy.js";
import { ObjectStrategy } from "../MsgStrategies/ObjectStrategy.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import { Address } from "../../Models/Address.js";
import { IPeerProvider } from "../../API/Services/IPeerProvider.js";
import { container } from "../../Services/NodeContainerService.js";
import { OpenConnection } from "../../Models/OpenConnection.js";
import { Transaction } from "../../Models/Transaction.js";

export class GetObjectsRequest extends RequestStrategy<void> {
    pendingTxids: string[];
    myAddress: Address;
    eventName: string;
    foundObjects: ApplicationObject[];

    constructor(pendinIds: string[], myAddress:Address) {
        super();
        this.pendingTxids = pendinIds;
        this.myAddress = myAddress;
        this.eventName = pendinIds[0];
        this.foundObjects = [];
    }

    OnFullfilled(): void {
        container[this.myAddress.toString()].eventEmitter.emit(this.eventName, this.foundObjects);
    }

    IsFullfilled(): boolean {
        if(this.pendingTxids.length === 0)
            return true;
        return false;
    }
    
    OnMsgStrategy(msgStrat: MsgStrategy): void {
        if(msgStrat instanceof ObjectStrategy) {
            let appObj = ApplicationObject.Parse(msgStrat.msg, this.myAddress);

            if(appObj.object instanceof Transaction) {
                // check if we can remove it from pending Txids
                let appObjId = appObj.GetID();
                let i = this.pendingTxids.findIndex((id) => id === appObjId) 
                if (i !== -1){
                    this.foundObjects.push(appObj);
                    this.pendingTxids.splice(i,1);
                }
            }
        }
    }
    async HandleRequest(): Promise<ApplicationObject[]> {
        container[this.myAddress.toString()].pendingRequestProvider.AddRequest(this);
        return new Promise((resolve, reject) => {
            var peerProvider: IPeerProvider = container[this.myAddress.toString()].peerProvider
            var openConnections: OpenConnection[] = peerProvider.GetOpenConnections()
            // send Get Object to the network
            for(let txid of this.pendingTxids) {
                for(let openCon of openConnections) {
                    openCon.SendGetObject(txid);
                }
            }
            let eventEmitter = container[this.myAddress.toString()].eventEmitter;
            eventEmitter.on(this.eventName, (objects: ApplicationObject[] ) => {
                eventEmitter.removeListener(this.eventName,()=> {});
                resolve(objects);
            })
        })
    }
}




