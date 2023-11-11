import { IConnectionProvider } from "../API/Services/IConnectionProvider.js";
import { IDBConnectionProvider } from "../API/Services/IDBConnectionProvider.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { IPendingReqeustProvider } from "../API/Services/IPendingRequestProvider.js";
import { MyLogger } from "../Localization/RuntimeLocal.js";
import { EventEmitter } from "events";
import { IUTXOSetProvider } from "../API/Services/IUTXOSetProvider.js";
import { IChainProvider } from "../API/Services/IChainProvider.js";
import { IMempoolProvider } from "../API/Services/IMempoolProvider.js";
import { MarabuNode } from "../MarabuNode.js";

export var container: {[address: string] : NodeContainer} = {};


export class NodeContainer{
    peerProvider: IPeerProvider;
    msgProvider:IMessageProvider;
    conProvider: IConnectionProvider;
    DBConProvider: IDBConnectionProvider;
    logger: MyLogger;
    pendingRequestProvider: IPendingReqeustProvider;
    eventEmitter: EventEmitter;
    utxoSetProvider: IUTXOSetProvider;
    chainProvider: IChainProvider;
    mempoolProvider: IMempoolProvider;
    marabuNode: MarabuNode;


    constructor(peerProvider: IPeerProvider, msgProvider:IMessageProvider, conProvider: IConnectionProvider,
            DBConProvider: IDBConnectionProvider, logger: MyLogger, pendingRequestProvider: IPendingReqeustProvider,
            utxoSetProvider: IUTXOSetProvider, chainProvider: IChainProvider, mempoolProvider: IMempoolProvider,
            marabuNode: MarabuNode, eventEmitter: EventEmitter) {
        this.peerProvider = peerProvider;
        this.msgProvider = msgProvider;
        this.conProvider = conProvider;
        this.DBConProvider = DBConProvider;
        this.logger = logger;
        this.pendingRequestProvider = pendingRequestProvider;
        this.utxoSetProvider = utxoSetProvider;
        this.chainProvider = chainProvider;
        this.mempoolProvider = mempoolProvider;
        this.marabuNode = marabuNode;
        this.eventEmitter = eventEmitter;


    }
}

