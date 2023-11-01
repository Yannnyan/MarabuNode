import { PeerManager } from "./PeerManageService.js";
import { Address } from "../Models/Address.js";
import { OpenConnection } from "../Models/OpenConnection.js";
import * as net from 'net';
import { MessageManager } from "./MessageManageService.js";
import {GetLog} from '../Localization/RuntimeLocal.js'
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };
import { IConnectionProvider } from "../API/Services/IConnectionProvider.js"; 
import { injectable } from "tsyringe";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";


@injectable()
export class ConnectionManager implements IConnectionProvider{
    peerProvider: IPeerProvider;
    msgProvider: IMessageProvider;
    host: string;
    port: number;
    constructor(peerManager: IPeerProvider, messageManager: IMessageProvider, host:string, port: number) {
        this.peerProvider = peerManager;
        this.msgProvider = messageManager;
        this.host = host;
        this.port = port;
    }

    CheckIsMe(address: Address) {
        return this.host === address.host && this.port === address.port;
    }

    ConnectToAddress(address: Address) {
        // assumes the address is not one that is connected
        console.log(GetLog(RuntimeLocal["Node Connect"]) + " " + address.toString());
        var socket = new net.Socket();
    
        socket.connect({host: address.host, port: address.port}, () => {
            var peer: OpenConnection = new OpenConnection(socket, true);
            this.peerProvider.AddOpenConnection(peer);
            this.peerProvider.AddAddress(address);

            socket.on("data", (data:Buffer) => {
                try {
                    this.msgProvider.GetMessage(data, peer);
                }
                catch(error) {
                    console.log(error);
                    peer.SendError();
                }
            })
            peer.SendHello();
            // peer.SendGetPeers();
        });
    
    }

    async ListenToConnections() {
        var conMan = this;
        const server = net.createServer((socket: net.Socket) => {
            var peer = new OpenConnection(socket, false);
            this.peerProvider.AddOpenConnection(peer);

            socket.on("data", (data:Buffer) => {
                try {
                    conMan.msgProvider.GetMessage(data,peer);
                }
                catch(error) {
                    console.log(error)
                    peer.SendError();
                }
            })
            
        });
        server.listen(this.port, this.host)
        console.log(RuntimeLocal["Started Listening"] + " " + this.host+ ":" + this.port)
    }

    AddPeersFromAddresses(addresses: Address[]) {
        for(let address of addresses){
            this.ConnectToAddress(address);
        }
    }
}
