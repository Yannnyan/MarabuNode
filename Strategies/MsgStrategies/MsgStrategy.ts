import { IConnectionProvider } from "../../API/Services/IConnectionProvider.js";
import { IPeerProvider } from "../../API/Services/IPeerProvider.js";
import { OpenConnection } from "../../Models/OpenConnection.js";
import ErrorLocal from '../../Localization/ErrorLocal.json' assert { type: "json" };


export abstract class MsgStrategy {
    peer: OpenConnection;
    peerManager: IPeerProvider;
    connectionManager: IConnectionProvider;
    valid_peer_version?: boolean;
    msg: any;

    constructor(peer: OpenConnection, peerManager: IPeerProvider, connectionManager: IConnectionProvider, msg:any) {
        this.peer = peer;
        this.peerManager = peerManager;
        this.connectionManager = connectionManager;
        this.msg = msg;
    }
   
  CheckVersion(msg?: any): boolean {
    if(this.valid_peer_version !== undefined)
        return this.valid_peer_version;
    if (msg === undefined){
        return false;
    }
    var version: string = msg["version"] // check version of the node
    if(! version.startsWith("0.8"))
    {
      console.log(ErrorLocal["Runtime Wrong Agent Version"]);
      this.valid_peer_version = false;
    }
    else{
        this.valid_peer_version = true;
    }
    return this.valid_peer_version;
  }

  CheckHasPeers(msg: any) {
    try{
      var peers: string[] = msg['peers'];
      if(peers.length === 0)
      {
        return [];
      }
      else {
        return peers;
      }
    }
    catch(error) {
      console.log(ErrorLocal["Runtime Wrong Message Format"])
      return [];
    }
  }

  CheckValidMsg(msgType: any, msg: any) {
    var msgTypeKeys = Object.keys(msgType)
    var msgKeys = Object.keys(msg);
    if(msgKeys.every((key) => msgTypeKeys.includes(key)) && msgTypeKeys.every((key) => msgKeys.includes(key))){
        console.log(ErrorLocal['Runtime Wrong Message Format'])
        return true;
    }
    return false;
  }

    abstract HandleMessage(): void;
  }