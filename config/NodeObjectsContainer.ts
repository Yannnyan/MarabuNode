import { IConnectionProvider } from "../API/Services/IConnectionProvider.js";
import { IDBConnectionProvider } from "../API/Services/IDBConnectionProvider.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { Address } from "../Models/Address.js";
import { ConnectionManager } from "../Services/ConnectionManageService.js";
import { PeerManager } from "../Services/PeerManageService.js";


export var container: {[address: string] : NodeContainer} = {};


export class NodeContainer{
    peerProvider: IPeerProvider;
    msgProvider:IMessageProvider;
    conProvider: IConnectionProvider;
    DBConProvider: IDBConnectionProvider;
    constructor(peerProvider: IPeerProvider, msgProvider:IMessageProvider, conProvider: IConnectionProvider,
            DBConProvider: IDBConnectionProvider) {
        this.peerProvider = peerProvider;
        this.msgProvider = msgProvider;
        this.conProvider = conProvider;
        this.DBConProvider = DBConProvider;
        
    }
}

