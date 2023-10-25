import * as net from "net";
import ErrorLocal from '../Localization/ErrorLocal.json' assert { type: "json" };
;
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };

import HelloMsg from '../Messages/Hello.json' assert { type: "json" };
;
import ErrorMsg from '../Messages/Error.json' assert { type: "json" };
; 
import GetPeersMsg from '../Messages/GetPeers.json' assert { type: "json" };

import IHaveObjMsg from '../Messages/IHaveObject.json' assert { type: "json" };

import GetObjMsg from '../Messages/GetObject.json' assert { type: "json" };



import {ApplicationObject} from '../Models/ApplicationObject.js';
import { GetLog } from "../Localization/RuntimeLocal.js";

var canonicalize = JSON.stringify


export class OpenConnection {
    encoding: BufferEncoding = "utf-8";
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

    SendMsg(msg?: string, msgDict?: {}) {
        if (msgDict !== undefined)
            this.socket.write(canonicalize(msgDict) + "\n", this.encoding);
        else if (msg !== undefined)
            this.socket.write(msg + "\n", this.encoding);
        else 
            throw new Error("Cannot send nothing, msg and msgDict are undefined");
    }

    SendHello() {
        console.log(GetLog(RuntimeLocal["Node Hello"]))
        this.SendMsg(undefined,HelloMsg)
    }

    SendError() {
        console.log(GetLog(RuntimeLocal["Node Error"]))
        this.SendMsg(undefined, ErrorMsg)
    }

    SendPeers(peers: any) {
        this.SendMsg(undefined, peers)
    }

    SendGetPeers() {
        this.SendMsg(undefined, GetPeersMsg)
    }

    SendIHaveObject(objectid: string) {
        var ihaveobj = IHaveObjMsg;
        ihaveobj.objectid = objectid;
        this.SendMsg(undefined, ihaveobj);
    }

    SendGetObject(objectid: string) {
        var getobj = GetObjMsg;
        getobj.objectid = objectid;
        this.SendMsg(undefined, getobj);
    }

    SendObject(appObj: ApplicationObject) {
        this.SendMsg(appObj.ToString());
    }
    
    
}