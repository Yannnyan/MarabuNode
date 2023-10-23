import * as net from "net";
// import { StringDecoder } from "string_decoder";

import {PeerManager} from './Services/PeerManageService';
import { OpenConnection } from "./Models/OpenConnection";
import { Address } from "./Models/Address";
import ErrorLocal from "./Localization/ErrorLocal.json"
import RuntimeLocal from "./Localization/RuntimeLocal.json"
import { GetLog } from "./Localization/RuntimeLocal";
import TestHardCodedIps from './Discovery/TestHardCodedIPs.json'
import { ConnectionManager } from "./Services/ConnectionManageService";
import { MessageManager } from "./Services/MessageManageService";
import { ApplicationObject } from "./Models/ApplicationObject";



interface GenericMsg {
  type: string
}


export class MarabuNode {
    peerManager: PeerManager;
    connectionManager: ConnectionManager;
    messageManager: MessageManager;
    port: number;
    host: string;

  constructor(port?: number, host?: string) {
    this.port = port || 18018;
    this.host = host || '127.0.0.1';
    this.peerManager = new PeerManager(new Address(this.host,this.port));
    this.messageManager = new MessageManager(this.peerManager);
    this.connectionManager = new ConnectionManager(this.peerManager, this.messageManager, this.host, this.port);
    this.messageManager.SetConnectionManager(this.connectionManager);
  }
  

  BootstrapDiscovery() {
    // connect to the hard coded ips
    for(let s of TestHardCodedIps.ips) {
      let address = Address.CreateAddressFromString(s);
      console.log(address);
      if(address.host === this.host && address.port === this.port){
        continue;
      }
      if(this.peerManager.FindPeer(address.host, address.port) === undefined) {
        console.log(GetLog(RuntimeLocal["Node Discovery"]) + " " + address.toString())
        this.connectionManager.ConnectToAddress(address);
      }
    }
  }

  Gossip(obj: ApplicationObject) {
    for(let peer of this.peerManager.openConnections) {
        peer.SendIHaveObject(obj.GetID())
    }
  }

  async Start(){
    this.connectionManager.ListenToConnections();
    this.BootstrapDiscovery();
  }
}
