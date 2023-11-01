import * as net from "net";
// import { StringDecoder } from "string_decoder";

import { OpenConnection } from "./Models/OpenConnection.js";
import { Address } from "./Models/Address.js";
import RuntimeLocal from "./Localization/RuntimeLocal.json" assert { type: "json" };
import { GetLog } from "./Localization/RuntimeLocal.js";
import TestHardCodedIps from './Discovery/TestHardCodedIPs.json' assert { type: "json" };
import { ApplicationObject } from "./Models/ApplicationObject.js";
import {container,autoInjectable} from "tsyringe"
import { IDBConnectionProvider } from "./API/Services/IDBConnectionProvider.js";
import { IConnectionProvider } from "./API/Services/IConnectionProvider.js";
import { IMessageProvider } from "./API/Services/IMessageProvider.js";
import { IPeerProvider } from "./API/Services/IPeerProvider.js";


@autoInjectable()
export class MarabuNode {
    peerProvider: IPeerProvider;
    conProvider: IConnectionProvider;
    msgProvider: IMessageProvider;
    dbConProvider: IDBConnectionProvider;
    port: number;
    host: string;

  constructor(msgManager: IMessageProvider, connectionManager: IConnectionProvider, peerManager: IPeerProvider,
                dbConProvider: IDBConnectionProvider,port?: number, host?: string, ) {
    this.port = port || 18018;
    this.host = host || '127.0.0.1';
    this.peerProvider = peerManager;
    this.msgProvider = msgManager;
    this.conProvider = connectionManager
    this.dbConProvider = dbConProvider;
  }
  

  BootstrapDiscovery() {
    // connect to the hard coded ips
    for(let s of TestHardCodedIps.ips) {
      let address = Address.CreateAddressFromString(s);
      console.log(address);
      if(address.host === this.host && address.port === this.port){
        continue;
      }
      if(this.peerProvider.FindServer(address.host, address.port) === undefined) {
        console.log(GetLog(RuntimeLocal["Node Discovery"]) + " " + address.toString())
        this.conProvider.ConnectToAddress(address);
      }
    }
  }

  GossipNewTransaction(obj: ApplicationObject, senderPeer: OpenConnection) {
    this.msgProvider.GetMessage(Buffer.from(obj.ToString() + '\n' , "utf-8"), senderPeer);
  }
  

  async Start(){
    this.conProvider.ListenToConnections();
    this.BootstrapDiscovery();
  }
}
