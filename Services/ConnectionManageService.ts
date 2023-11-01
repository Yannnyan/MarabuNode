import { Address } from "../Models/Address.js";
import { OpenConnection } from "../Models/OpenConnection.js";
import * as net from 'net';
import {GetLog} from '../Localization/RuntimeLocal.js'
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };
import { IConnectionProvider } from "../API/Services/IConnectionProvider.js"; 
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { container } from "../config/NodeObjectsContainer.js";


export class ConnectionManager implements IConnectionProvider{
    peerProvider?: IPeerProvider;
    msgProvider?: IMessageProvider;
    address: Address;
    constructor(address: Address) {
        this.address = address;
    }   

    #SetUninitialized() {
        this.peerProvider = container[this.address.toString()].peerProvider;
        this.msgProvider = container[this.address.toString()].msgProvider;
    }
    CheckIsMe(address: Address) {
        return this.address.host === address.host && this.address.port === address.port;
    }

    ConnectToAddress(address: Address) {
        if( !this.peerProvider || !this.msgProvider)
            this.#SetUninitialized();
        if (! this.peerProvider || !this.msgProvider)
            throw new Error("cannot find peer provider or msgprovider");
        var peerProvider = this.peerProvider;
        var msgProvider = this.msgProvider;
        
        // assumes the address is not one that is connected
        console.log(GetLog(RuntimeLocal["Node Connect"]) + " " + address.toString());
        var socket = new net.Socket();
    
        return socket.connect({host: address.host, port: address.port}, () => {
            
            var peer: OpenConnection = new OpenConnection(socket, true);
            peerProvider.AddOpenConnection(peer);
            peerProvider.AddAddress(address);

            socket.on("data", (data:Buffer) => {
                try {
                    msgProvider.GetMessage(data, peer);
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
        if( !this.peerProvider || !this.msgProvider)
            this.#SetUninitialized();
        if (! this.peerProvider || !this.msgProvider)
            throw new Error("cannot find peer provider or msgprovider");
        var peerProvider = this.peerProvider;
        var msgProvider = this.msgProvider;
        
        const server = net.createServer((socket: net.Socket) => {
            var peer = new OpenConnection(socket, false);
            peerProvider.AddOpenConnection(peer);

            socket.on("data", (data:Buffer) => {
                try {
                    msgProvider.GetMessage(data,peer);
                }
                catch(error) {
                    console.log(error)
                    peer.SendError();
                }
            })
            
        });
        server.listen(this.address.port, this.address.host)
        console.log(RuntimeLocal["Started Listening"] + " " + this.address.toString())
    }

    AddPeersFromAddresses(addresses: Address[]) {
        for(let address of addresses){
            this.ConnectToAddress(address);
        }
    }
}
