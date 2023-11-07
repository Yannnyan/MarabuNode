import * as net from "net";
import ErrorLocal from '../Localization/ErrorLocal.json' assert { type: "json" };;
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };
import HelloMsg from '../Messages/Hello.json' assert { type: "json" };;
import ErrorMsg from '../Messages/Error.json' assert { type: "json" };; 
import GetPeersMsg from '../Messages/GetPeers.json' assert { type: "json" };
import IHaveObjMsg from '../Messages/IHaveObject.json' assert { type: "json" };
import GetObjMsg from '../Messages/GetObject.json' assert { type: "json" };
import ChainTipMsg from '../Messages/ChainTip.json' assert { type: "json" };
import GetChainTipMsg from '../Messages/GetChainTip.json' assert { type: "json" };

import { container } from "../Services/NodeContainerService.js";


import {ApplicationObject} from '../Models/ApplicationObject.js';
import { Address } from "./Address.js";
import { Block } from "./Block.js";

var canonicalize = JSON.stringify


export class OpenConnection {
    encoding: BufferEncoding = "utf-8";
    remoteAddress: Address;
    myAddress: Address;
    socket: net.Socket;
    isClient: boolean;
    isHandshaked: boolean;

    constructor(socket:net.Socket, isClient: boolean, myAddress: Address){
        if(socket.remoteAddress === undefined)
        {
            throw new Error(ErrorLocal["Runtime Peer Construction Address"]);
        }
        if (socket.remotePort === undefined) {
            throw new Error(ErrorLocal["Runtime Peer Construction Port"]);
        }
        this.myAddress = myAddress;
        this.remoteAddress = new Address(socket.remoteAddress,socket.remotePort);
        this.socket =  socket;
        this.isClient = isClient;
        this.isHandshaked = false;
    }

    #Log(msg: string) {
        container[this.myAddress.toString()].logger.Log(msg)
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
        this.#Log(RuntimeLocal["Send Hello"])
        this.SendMsg(undefined,HelloMsg)
    }

    SendError() {
        this.#Log(RuntimeLocal["Send Error"])
        this.SendMsg(undefined, ErrorMsg)
    }

    SendPeers(peers: any) {
        this.#Log(RuntimeLocal["Send Peers"])
        this.SendMsg(undefined, peers)
    }

    SendGetPeers() {
        this.#Log(RuntimeLocal["Send GetPeers"])
        this.SendMsg(undefined, GetPeersMsg)
    }

    SendIHaveObject(objectid: string) {
        this.#Log(RuntimeLocal["Send IHaveObject"])
        var ihaveobj = IHaveObjMsg;
        ihaveobj.objectid = objectid;
        this.SendMsg(undefined, ihaveobj);
    }

    SendGetObject(objectid: string) {
        this.#Log(RuntimeLocal["Send GetObject"])
        var getobj = GetObjMsg;
        getobj.objectid = objectid;
        this.SendMsg(undefined, getobj);
    }

    SendObject(appObj: ApplicationObject) {
        this.#Log(RuntimeLocal["Send Object"])
        this.SendMsg(appObj.ToString());
    }

    SendChainTip(block: Block) {
        this.#Log(RuntimeLocal["Send Chaintip"])
        var chaintip = ChainTipMsg;
        chaintip.blockid = block.GetID();
        this.SendMsg(undefined, chaintip)
    }
    SendGetChainTip() {
        this.#Log(RuntimeLocal["Send GetChaintip"])
        this.SendMsg(undefined, GetChainTipMsg);
    }
    
    
}