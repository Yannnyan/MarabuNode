import { OpenConnection } from "../Models/OpenConnection";
import ErrorLocal from '../Localization/ErrorLocal.json';
import { PeerManager } from "./PeerManageService";
import { HandShakeStrategy, MsgStrategy, PeersStrategy, GetPeersStrategy, IHaveObjectStrategy, MsgStrategyFactory, ObjectStrategy, GetObjectStrategy } from "../MsgStrategies";
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
    
      
    ParseMessages(msgs: string[], openConnection:OpenConnection): MsgStrategy[] {
        console.log(GetLog(RuntimeLocal["Node Parse"]))
        if(this.connectionManager === undefined)
            throw new Error(ErrorLocal["Runtime instance not exists"])
        var strats:MsgStrategy[] = []
        var stratFactory = new MsgStrategyFactory(openConnection, this.peerManager, this.connectionManager, msg);
        for(let m of msgs) {
          var keys: string[] = Object.keys(msg)
          var msg = JSON.parse(m);
          if (! this.#CheckType(keys)) return [];
          // not handshake and first message
          if (!openConnection.isHandshaked && ! this.#CheckHandshake(msg, openConnection)) return [];  
          var msgStrat = this.ParseMessage(msg, openConnection, stratFactory);
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

      ParseMessage(msg: any, openConnection: OpenConnection, stratFactory: MsgStrategyFactory): MsgStrategy | undefined{
        var msgStrat;
        switch(msg["type"]) {
          case "hello":
            openConnection.isHandshaked = true;
            msgStrat = stratFactory.CreateStrategy(typeof(HandShakeStrategy));
            break;
          case "getPeers":
            msgStrat = stratFactory.CreateStrategy(typeof(GetPeersStrategy));
            break;
          case "peers":
            msgStrat = stratFactory.CreateStrategy(typeof(PeersStrategy));
            break;
          case "ihaveobject":
              msgStrat = stratFactory.CreateStrategy(typeof(IHaveObjectStrategy));
              break;
          case "object":
              msgStrat = stratFactory.CreateStrategy(typeof(ObjectStrategy));
              break;
          case "getobject":
              msgStrat = stratFactory.CreateStrategy(typeof(GetObjectStrategy));
              break;

        }

        return msgStrat;
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
        var msgStrats = this.ParseMessages(this.DivideMessage(msg.toString(this.encoding)), peer)
        msgStrats?.forEach((strat) => strat.HandleMessage());
      }
}