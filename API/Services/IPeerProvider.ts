import { Address } from "../../Models/Address.js";
import { OpenConnection } from "../../Models/OpenConnection.js";
import * as net from "net"
import { MsgStrategyFactory } from "../../Strategies/MsgStrategies/MsgStrategyFactory.js";



export interface IPeerProvider {
    AddOpenConnections: (peers: OpenConnection[]) => void;
    AddAddress: (address: Address) => void;
    AddAddresses: (addresses: Address[]) => void;
    AddOpenConnection: (peer: OpenConnection) => void;
    GetPeers:() => any;
    FindServer: (host?: string ,port?: number, socket?: net.Socket) => Address | undefined;
    GetOpenConnections: () => OpenConnection[];
    GetConFactoryMap: () => Map<OpenConnection,MsgStrategyFactory>;
    RemoveOpenConnection: (peer: OpenConnection) => void;
}