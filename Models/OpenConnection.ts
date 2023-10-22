import * as net from "net";
import ErrorLocal from '../Localization/ErrorLocal.json';
import RuntimeLocal from '../Localization/RuntimeLocal.json'
import HelloMsg from '../Messages/Hello.json';
import ErrorMsg from '../Messages/Error.json'; 
import GetPeersMsg from '../Messages/GetPeers.json'
import { GetLog } from "../Localization/RuntimeLocal";



export class OpenConnection {
    port: number;
    host: string;
    socket: net.Socket;
    isClient: boolean;
    isHandshaked: boolean;

    constructor(socket:net.Socket, isClient: boolean){
        if(socket.remoteAddress === undefined)
        {
            throw new Error(ErrorLocal["Runtime Peer Construction Address"]);
        }
        if (socket.remotePort === undefined) {
            throw new Error(ErrorLocal["Runtime Peer Construction Port"]);
        }
        this.port = socket.remotePort;
        this.host = socket.remoteAddress;
        this.socket =  socket;
        this.isClient = isClient;
        this.isHandshaked = false;
    }

    SendHello() {
        console.log(GetLog(RuntimeLocal["Node Hello"]))
        this.socket.write(JSON.stringify(HelloMsg) + "\n", "utf-8");
    }

    SendError() {
        console.log(GetLog(RuntimeLocal["Node Error"]))
        this.socket.write(JSON.stringify(ErrorMsg) + "\n", "utf-8");
    }

    SendPeers(peers: string) {
        this.socket.write(peers + "\n", "utf-8")
    }

    SendGetPeers() {
        this.socket.write(JSON.stringify(GetPeersMsg) + "\n", "utf-8");
    }
    
    
}