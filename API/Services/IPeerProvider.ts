import { Address } from "../../Models/Address.js";
import { OpenConnection } from "../../Models/OpenConnection.js";
import * as net from "net"



export interface IPeerProvider {
    AddPeers: (peers: OpenConnection[]) => void;
    AddAddress: (address: Address) => void;
    AddAddresses: (addresses: Address[]) => void;
    AddPeerFromSocket: (socket: net.Socket, isClient: boolean) => void;
    AddPeer: (peer: OpenConnection) => void;
    GetPeers:() => any;
    FindPeer: (host?: string ,port?: number, socket?: net.Socket) => Address | undefined;
    GetOpenConnections: () => OpenConnection[];
}