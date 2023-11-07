import { OpenConnection } from "./Models/OpenConnection.js";
import { Address } from "./Models/Address.js";
import RuntimeLocal from "./Localization/RuntimeLocal.json" assert { type: "json" };
import {MyLogger } from "./Localization/RuntimeLocal.js";
import TestHardCodedIps from './Discovery/TestHardCodedIPs.json' assert { type: "json" };
import { ApplicationObject } from "./Models/ApplicationObject.js";
import { IDBConnectionProvider } from "./API/Services/IDBConnectionProvider.js";
import { IConnectionProvider } from "./API/Services/IConnectionProvider.js";
import { IMessageProvider } from "./API/Services/IMessageProvider.js";
import { IPeerProvider } from "./API/Services/IPeerProvider.js";
import { PeerManager } from "./Services/PeerManageService.js";
import { MessageManager } from "./Services/MessageManageService.js";
import { ConnectionManager } from "./Services/ConnectionManageService.js";
import { NodeContainer, container } from "./Services/NodeContainerService.js";
import { PendingRequestManager } from "./Services/PendingRequestManager.js";
import { IPendingReqeustProvider } from "./API/Services/IPendingRequestProvider.js";
import { DBConnectionManager } from "./Services/DbConnectionManagerService.js";
import { IUTXOSetProvider } from "./API/Services/IUTXOSetProvider.js";
import { IChainProvider } from "./API/Services/IChainProvider.js";
import { UTXOManager } from "./Services/UTXOManager.js";
import { ChainManager } from "./Services/ChainManager.js";



export class MarabuNode {
    peerProvider: IPeerProvider;
    conProvider: IConnectionProvider;
    msgProvider: IMessageProvider;
    dbConProvider: IDBConnectionProvider;
    logger: MyLogger;
    pendReqProvider: IPendingReqeustProvider;
    address: Address;
    utxoProvider: IUTXOSetProvider;
    chainProvider: IChainProvider;

  constructor(host: string, port: number) {
    this.address = new Address(host, port);
    this.peerProvider = new PeerManager(this.address);
    this.msgProvider = new MessageManager(this.address);
    this.conProvider = new ConnectionManager(this.address);
    this.dbConProvider = new DBConnectionManager(this.address);
    this.logger = new MyLogger(this.address);
    this.pendReqProvider = new PendingRequestManager(this.address);
    this.utxoProvider = new UTXOManager(this.address);
    this.chainProvider = new ChainManager(this.address);


    container[this.address.toString()] = new NodeContainer(this.peerProvider,this.msgProvider, 
      this.conProvider, this.dbConProvider, this.logger, this.pendReqProvider, this.utxoProvider, this.chainProvider);
  }
  

  async BootstrapDiscovery(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      // connect to the hard coded ips
      for(let s of TestHardCodedIps.ips) {
        let address = Address.CreateAddressFromString(s);
        console.log(address);
        if(address.host === this.address.host && address.port === this.address.port){
          continue;
        }
        if(this.peerProvider.FindServer(address.host, address.port) === undefined) {
          this.logger.Log(RuntimeLocal.Discovery);
          await this.conProvider.ConnectToAddress(address);
        }
      }
      resolve();
    })
  }

  BroadcastGetChainTip() {
      for(let opencon of this.peerProvider.GetOpenConnections()){
        opencon.SendGetChainTip();
      }
  }

  GossipNewTransaction(obj: ApplicationObject, senderPeer: OpenConnection) {
    this.msgProvider.GetMessage(Buffer.from(obj.ToString() + '\n' , "utf-8"), senderPeer);
  }
  

  async Start(){
    this.conProvider.ListenToConnections();
    await this.BootstrapDiscovery();
    this.BroadcastGetChainTip();
  }
}
