import { PeerManager } from "./PeerManageService";
import { Address } from "../Models/Address";
import { OpenConnection } from "../Models/OpenConnection";
import * as net from 'net';
import { MessageManager } from "./MessageManageService";
import {GetLog} from '../Localization/RuntimeLocal'
import RuntimeLocal from '../Localization/RuntimeLocal.json'

export class ConnectionManager {
    peerManager: PeerManager;
    messageManager: MessageManager;
    host: string;
    port: number;
    constructor(peerManager: PeerManager, messageManager: MessageManager, host:string, port: number) {
        this.peerManager = peerManager;
        this.messageManager = messageManager;
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
            socket.on("data", (data:Buffer) => {
                try {
                    this.messageManager.GetMessage(data, peer);
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
        var node = this;
        const server = net.createServer((socket: net.Socket) => {
            var peer = new OpenConnection(socket, false);

            socket.on("data", (data:Buffer) => {
                try {
                    node.messageManager.GetMessage(data,peer);
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
