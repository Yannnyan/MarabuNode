import { Socket } from "dgram";
import * as net from "net";
import KnownPeers from '../Discovery/KnownPeers.json' assert { type: "json" };

import * as ErrorLocal from '../Localization/ErrorLocal.json' assert { type: "json" };

import * as fs from "fs"
import PeersMsg from '../Messages/Peers.json' assert { type: "json" };

import {OpenConnection} from '../Models/OpenConnection.js';
import { Address } from "../Models/Address.js";
import {autoInjectable} from "tsyringe"
import { IPeerProvider } from "../API/Services/IPeerProvider.js";

@autoInjectable()
export class PeerManager implements IPeerProvider {
    openConnections: OpenConnection[];
    peerList: Address[];
    peerMsg;

    constructor(adress: Address) {
        this.openConnections = [];
        this.peerList = [adress];
        this.peerMsg = {"type": PeersMsg.type, "peers": PeersMsg.peers};
    }
    GetOpenConnections(): OpenConnection[] {
        return this.openConnections;
    }

    #UpdatePeers() {
        var lst: string[] = this.peerList.map((address: Address) => address.host + ":" + address.port.toString());
        this.peerMsg.peers = lst;
        // fs.open('../Discovery/KnownPeers.json', (err,fd) => {
        //     fs.writeFile(fd, new Uint8Array(Buffer.from(JSON.stringify(KnownPeers))),()=>{});
        // });
    }
    AddPeers(peers: OpenConnection[])
    {
        this.openConnections.push(...peers);
        this.#UpdatePeers()
    }
    AddAddress(address: Address) {
        this.peerList.push(address);
    }
    AddAddresses(addresses: Address[]) {
        this.peerList.push(...addresses);
    }
    AddPeerFromSocket(socket: net.Socket, isClient: boolean)
    {
        var peer: OpenConnection = new OpenConnection(socket, isClient);
        if(this.FindPeer(peer.host, peer.port) === undefined)
        {
            return;
        }
        this.#UpdatePeers();
    }
    AddPeer(peer: OpenConnection) {
        if(this.FindPeer(peer.host, peer.port) !== undefined)
        {
            return false;
        }
        this.openConnections.push(peer);
        this.#UpdatePeers()
        return true;
    }

    GetPeers() {
        return this.peerMsg;
    }

    FindPeer(host?: string ,port?: number, socket?: net.Socket) {
        if((socket === undefined && (host === undefined || port === undefined))){
            return undefined;
        }
        if(socket === undefined)
        {
            return this.peerList.find((peer) => peer.port === port && peer.host === host)
        }
        else
        {
            if(socket.remotePort === undefined || socket.remoteAddress === undefined){
                return undefined;
            }
            return this.peerList.find((peer) => peer.port === socket.remotePort && peer.host === socket.remoteAddress)
        }
    }
}


