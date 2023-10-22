import { OpenConnection } from "../Models/OpenConnection";
import ErrorLocal from '../Localization/ErrorLocal.json';
import { PeerManager } from "./PeerManageService";
import { HandShakeStrategy, MsgStrategy, PeersStrategy, GetPeersStrategy } from "../MsgStrategies";
import { ConnectionManager } from "./ConnectionManageService";
import RuntimeLocal from '../Localization/RuntimeLocal.json';
import { GetLog } from "../Localization/RuntimeLocal";

export class MessageManager {
    peerManager: PeerManager;
    connectionManager?: ConnectionManager;
    last_message: string;
    encoding: BufferEncoding;

    constructor(peerManager: PeerManager, connectionManager?: ConnectionManager){
        this.peerManager = peerManager;
        this.last_message = "";
        this.connectionManager = connectionManager;
        this.encoding = "utf-8";
    }

    SetConnectionManager(connectionManager: ConnectionManager) {
        this.connectionManager = connectionManager;
    }
    #CheckType(keys: string[]) {
        var type = keys.find((some:string) => some === "type");
        if(type === undefined){
            console.log(ErrorLocal["Runtime Wrong Message Format"]);
            return false;
        }
        return true;
        }
    
      #CheckHandshake(msg: any, peer:OpenConnection) {
        if (msg["type"] !== "hello" && this.peerManager.FindPeer(peer.host, peer.port) === undefined){
          peer.SendError();
          console.log(GetLog(ErrorLocal["Runtime Peer Handshake"]))
          peer.socket.destroy();
          return false;
        }
        return true;
      }
    
      
    ParseMessage(msgs: string[], openConnection:OpenConnection): MsgStrategy[] {
        console.log(GetLog(RuntimeLocal["Node Parse"]))
        if(this.connectionManager === undefined)
            throw new Error(ErrorLocal["Runtime instance not exists"])
        var strats:MsgStrategy[] = []
        for(let m of msgs) {
          var msg = JSON.parse(m);
          var keys: string[] = Object.keys(msg)
          if (! this.#CheckType(keys)) return [];
          // not handshake and first message
          if (!openConnection.isHandshaked && ! this.#CheckHandshake(msg, openConnection)) return [];
          var msgStrat;
          switch(msg["type"]) {
            case "hello":
              openConnection.isHandshaked = true;
              msgStrat = new HandShakeStrategy(openConnection, this.peerManager, this.connectionManager, msg); 
              break;
            case "getPeers":
              msgStrat = new GetPeersStrategy(openConnection, this.peerManager, this.connectionManager,msg);
              break;
            case "peers":
              msgStrat = new PeersStrategy(openConnection, this.peerManager, this.connectionManager,msg);
              break;
          }

          if(msgStrat === undefined)
          {
            console.log(ErrorLocal["Runtime Parse Error"]);
            return [];
          }
          else
            strats.push(msgStrat);
        }
        return strats;
      }
    
      DivideMessage(msg: string): string[] {
        var msgs: string[] = msg.split("\n");
        if(msgs.at(-1) === ""){
            msgs.pop();
        }
        if(msgs.at(-1) === undefined) {
          return [];
        }
        // concatenate message from previous break
        if(this.last_message !== "") {
           msgs[0] = this.last_message + msgs[0];
           this.last_message = "";
        }
        if(!msg.endsWith("\n"))
        {
          this.last_message = msgs[msgs.length - 1];
          msgs.pop();
        }
        return msgs;
      }

      GetMessage(msg: Buffer, peer: OpenConnection) {
        console.log(GetLog(RuntimeLocal["Node Data"]) + msg.toString(this.encoding));
        var msgStrats = this.ParseMessage(this.DivideMessage(msg.toString(this.encoding)), peer)
        msgStrats?.forEach((strat) => strat.HandleMessage());
      }
}