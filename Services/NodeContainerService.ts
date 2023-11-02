import { IConnectionProvider } from "../API/Services/IConnectionProvider.js";
import { IDBConnectionProvider } from "../API/Services/IDBConnectionProvider.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { IPendingReqeustProvider } from "../API/Services/IPendingRequestProvider.js";
import { MyLogger } from "../Localization/RuntimeLocal.js";

export var container: {[address: string] : NodeContainer} = {};


export class NodeContainer{
    peerProvider: IPeerProvider;
    msgProvider:IMessageProvider;
    conProvider: IConnectionProvider;
    DBConProvider: IDBConnectionProvider;
    logger: MyLogger;
    pendingRequestProvider: IPendingReqeustProvider



    constructor(peerProvider: IPeerProvider, msgProvider:IMessageProvider, conProvider: IConnectionProvider,
            DBConProvider: IDBConnectionProvider, logger: MyLogger, pendingRequestProvider: IPendingReqeustProvider) {
        this.peerProvider = peerProvider;
        this.msgProvider = msgProvider;
        this.conProvider = conProvider;
        this.DBConProvider = DBConProvider;
        this.logger = logger;
        this.pendingRequestProvider = pendingRequestProvider;
    }
}

