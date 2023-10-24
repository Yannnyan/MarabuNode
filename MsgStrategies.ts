import { OpenConnection } from './Models/OpenConnection';
import { PeerManager } from './Services/PeerManageService';
import ErrorLocal from './Localization/ErrorLocal.json'
import RuntimeLocal from './Localization/RuntimeLocal.json'
import { GetLog } from './Localization/RuntimeLocal';
import { ConnectionManager } from './Services/ConnectionManageService';
import { Address } from './Models/Address';
import { ApplicationObject } from './Models/ApplicationObject';
import GetObjMsg from './Messages/GetObject.json'



export class MsgStrategyFactory {
    peer: OpenConnection;
    peerManager: PeerManager;
    connectionManager: ConnectionManager;
    valid_peer_version?: boolean;
    msg: any;

    constructor(peer: OpenConnection, peerManager: PeerManager, connectionManager: ConnectionManager, msg:any) {
        this.peer = peer;
        this.peerManager = peerManager;
        this.connectionManager = connectionManager;
        this.msg = msg;
    }

    CreateStrategy(strategy_type: string): MsgStrategy {
        switch(strategy_type){
            case typeof(HandShakeStrategy):                
                return new HandShakeStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            case typeof(PeersStrategy):
                return new PeersStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            case typeof(ObjectStrategy):
                return new ObjectStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            case typeof(GetPeersStrategy):
                return new GetPeersStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            case typeof(IHaveObjectStrategy):
                return new IHaveObjectStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            case typeof(GetObjectStrategy):
                return new GetObjectStrategy(this.peer, this.peerManager, this.connectionManager, this.msg);
            default:
                throw new Error("Cannot parse the strategy type. " + strategy_type);
        }
    }
}


export abstract class MsgStrategy {
    peer: OpenConnection;
    peerManager: PeerManager;
    connectionManager: ConnectionManager;
    valid_peer_version?: boolean;
    msg: any;

    constructor(peer: OpenConnection, peerManager: PeerManager, connectionManager: ConnectionManager, msg:any) {
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
  
export class HandShakeStrategy extends MsgStrategy{

    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node HandShake'] + " " + JSON.stringify(this.msg)))
        if (!this.CheckVersion(this.msg)) {
            // invalid peer, need to ignore the message
            this.peer.socket.destroy();
            return;
        }
        // if we already have the peer then ignore the hello message
        if(this.peerManager.FindPeer(this.peer.host, this.peer.port) !== undefined)
        {
            return;
        }
        this.peerManager.AddPeer(this.peer);
        if(!this.peer.isClient){
            this.peer.SendHello();
        }
        this.peer.SendGetPeers();
    }
}
  
export class GetPeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node GetPeers']))
        this.peer.SendPeers(this.peerManager.GetPeers())
    }
}

export class PeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node Peers']))
        var peers = this.CheckHasPeers(this.msg);
        var addresses = peers.map((s) => Address.CreateAddressFromString(s));
        addresses = addresses.filter((address) =>
         !this.connectionManager.CheckIsMe(address) && this.peerManager.FindPeer(address.host, address.port) === undefined);
        this.connectionManager.AddPeersFromAddresses(addresses);
        this.peerManager.AddAddresses(addresses);
    }
    
}


export class IHaveObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        var objectid = this.msg["objectid"]
        var strat = this;
        ApplicationObject.FindById(objectid).then(function(obj) {
            if(obj !== undefined) {
                return;
            }
            else
                strat.peer.SendGetObject(objectid);
        })
    }

}

export class ObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        let obj = ApplicationObject.Parse(this.msg);
        // validify object dont forget
        ApplicationObject.FindById(obj.GetID()).then((found) => {
            if (found === undefined) {
                obj.Save()
            }
        })
    }
    
}

export class GetObjectStrategy extends MsgStrategy {
    HandleMessage(): void {
        this.CheckValidMsg(GetObjMsg, this.msg);
        var peer = this.peer;
        ApplicationObject.FindById(this.msg["objectid"]).then(function(obj) {
            peer.SendObject(obj)
        }) 
        throw new Error('Method not implemented.');
    }
    
}



