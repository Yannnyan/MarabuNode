import * as net from "net";
import PeersMsg from '../Messages/Peers.json' assert { type: "json" };
import {OpenConnection} from '../Models/OpenConnection.js';
import { Address } from "../Models/Address.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { MsgStrategyFactory } from "../Strategies/MsgStrategies/MsgStrategyFactory.js";
import { ConnectionManager } from "./ConnectionManageService.js";
import { container } from "../config/NodeObjectsContainer.js";


export class PeerManager implements IPeerProvider {
    openConnections: OpenConnection[];
    peerFactoryMap: Map<OpenConnection,MsgStrategyFactory>;
    serverList: Address[];
    address: Address;
    peerMsg;

    constructor(adress: Address) {
        this.openConnections = [];
        this.serverList = [adress];
        this.peerMsg = {"type": PeersMsg.type, "peers": PeersMsg.peers};
        this.peerFactoryMap = new Map();
        this.address = adress;
    }
    GetOpenConnections(): OpenConnection[] {
        return this.openConnections;
    }
    GetConFactoryMap(): Map<OpenConnection,MsgStrategyFactory> {
        return this.peerFactoryMap;
    }
    #UpdatePeers() {
        var lst: string[] = this.serverList.map((address: Address) => address.host + ":" + address.port.toString());
        this.peerMsg.peers = lst;
        // fs.open('../Discovery/KnownPeers.json', (err,fd) => {
        //     fs.writeFile(fd, new Uint8Array(Buffer.from(JSON.stringify(KnownPeers))),()=>{});
        // });
    }
    AddOpenConnections(peers: OpenConnection[])
    {
        this.openConnections.push(...peers);
        for(let peer of peers)
            this.#AddOpenConnectionNoUpdate(peer)
        this.#UpdatePeers()
    }
    AddAddress(address: Address) {
        this.serverList.push(address);
    }
    AddAddresses(addresses: Address[]) {
        this.serverList.push(...addresses);
    }

    #AddOpenConnectionNoUpdate(peer: OpenConnection) {
        if(this.FindServer(peer.host, peer.port) !== undefined)
        {
            return false;
        }
        this.openConnections.push(peer);
        this.peerFactoryMap.set(peer, new MsgStrategyFactory(peer, this, container[this.address.toString()].conProvider));
        return true;
    }

    AddOpenConnection(peer: OpenConnection) {
        var ret = this.#AddOpenConnectionNoUpdate(peer);
        this.#UpdatePeers()
        return ret;
    }

    GetPeers() {
        return this.peerMsg;
    }

    FindServer(host?: string ,port?: number, socket?: net.Socket) {
        if((socket === undefined && (host === undefined || port === undefined))){
            return undefined;
        }
        if(socket === undefined)
        {
            return this.serverList.find((peer) => peer.port === port && peer.host === host)
        }
        else
        {
            if(socket.remotePort === undefined || socket.remoteAddress === undefined){
                return undefined;
            }
            return this.serverList.find((peer) => peer.port === socket.remotePort && peer.host === socket.remoteAddress)
        }
    }

    RemoveOpenConnection(peer: OpenConnection) {
        this.openConnections.splice(this.openConnections.indexOf(peer),1);
        this.peerFactoryMap.delete(peer);
        peer.socket.destroy();

    }
}


