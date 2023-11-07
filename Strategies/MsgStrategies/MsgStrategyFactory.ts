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
import { Address } from "../../Models/Address.js";
import { GetChainTipStrategy } from "./GetChainTipStrategy.js";
import { ChainTipStrategy } from "./ChainTipStrategy.js";


export class MsgStrategyFactory {
    peer: OpenConnection;
    address:Address;

    valid_peer_version?: boolean;

    constructor(
        peer: OpenConnection, 
        address: Address) {
        this.peer = peer;
        this.address = address;
    }
 
    CreateStrategy(strategy_type: string, msg:any): MsgStrategy {
        
        switch(strategy_type){
            case HandShakeStrategy.name:                
                return new HandShakeStrategy(this.peer, msg, this.address);
            case PeersStrategy.name:
                return new PeersStrategy(this.peer,  msg, this.address);
            case ObjectStrategy.name:
                return new ObjectStrategy(this.peer, msg, this.address);
            case GetPeersStrategy.name:
                return new GetPeersStrategy(this.peer, msg, this.address);
            case IHaveObjectStrategy.name:
                return new IHaveObjectStrategy(this.peer, msg, this.address);
            case GetObjectStrategy.name:
                return new GetObjectStrategy(this.peer, msg, this.address);
            case GetChainTipStrategy.name:
                return new GetChainTipStrategy(this.peer, msg, this.address);
            case ChainTipStrategy.name:
                return new ChainTipStrategy(this.peer, msg, this.address);
            case ErrorStrategy.name:
                return new ErrorStrategy(this.peer, msg, this.address);
            case UnknownMsgStrategy.name:
                return new UnknownMsgStrategy(this.peer, msg, this.address);
            default:
                throw new Error("Cannot parse the strategy type. " + strategy_type);
        }
    }
}