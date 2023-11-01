import { OpenConnection } from "../../Models/OpenConnection.js";
import { IPeerProvider } from "../../API/Services/IPeerProvider.js";
import { IConnectionProvider } from "../../API/Services/IConnectionProvider.js";
import { HandShakeStrategy } from "./HandShakeStrategy.js";
import { PeersStrategy } from "./PeersStrategy.js";
import { ObjectStrategy } from "./ObjectStrategy.js";
import { GetPeersStrategy } from "./GetPeersStrategy.js";
import { IHaveObjectStrategy } from "./IHaveObjectStrategy.js";
import { GetObjectStrategy } from "./GetObjectStrategy.js";
import { ErrorStrategy } from "./ErrorStrategy.js";
import { UnknownMsgStrategy } from "./UnknownMsgStrategy.js";
import { MsgStrategy } from "./MsgStrategy.js";
import { inject, injectable } from "tsyringe";
// import { ProviderTokens } from "../../config/ProviderTokens.js";


export class MsgStrategyFactory {
    peer: OpenConnection;
    peerProvider: IPeerProvider;
    conProvider: IConnectionProvider;
    valid_peer_version?: boolean;

    constructor(
        peer: OpenConnection, 
        peerManager: IPeerProvider,
        connectionManager: IConnectionProvider
        ) {
        this.peer = peer;
        this.peerProvider = peerManager;
        this.conProvider = connectionManager;
    }
 
    CreateStrategy(strategy_type: string, msg:any): MsgStrategy {
        switch(strategy_type){
            case HandShakeStrategy.name:                
                return new HandShakeStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case PeersStrategy.name:
                return new PeersStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case ObjectStrategy.name:
                return new ObjectStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case GetPeersStrategy.name:
                return new GetPeersStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case IHaveObjectStrategy.name:
                return new IHaveObjectStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case GetObjectStrategy.name:
                return new GetObjectStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case ErrorStrategy.name:
                return new ErrorStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            case UnknownMsgStrategy.name:
                return new UnknownMsgStrategy(this.peer, this.peerProvider, this.conProvider, msg);
            default:
                throw new Error("Cannot parse the strategy type. " + strategy_type);
        }
    }
}