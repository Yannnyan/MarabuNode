import { OpenConnection } from "../Models/OpenConnection.js";
import ErrorLocal from '../Localization/ErrorLocal.json' assert { type: "json" };;
import { PeerManager } from "./PeerManageService.js";
import { ConnectionManager } from "./ConnectionManageService.js";
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };
import {autoInjectable, injectable} from "tsyringe";
import { GetLog } from "../Localization/RuntimeLocal.js";
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
import { IConnectionProvider } from "../API/Services/IConnectionProvider.js";
import { HandShakeStrategy } from "../Strategies/MsgStrategies/HandShakeStrategy.js";
import { GetPeersStrategy } from "../Strategies/MsgStrategies/GetPeersStrategy.js";
import { ErrorStrategy } from "../Strategies/MsgStrategies/ErrorStrategy.js";
import { GetObjectStrategy } from "../Strategies/MsgStrategies/GetObjectStrategy.js";
import { IHaveObjectStrategy } from "../Strategies/MsgStrategies/IHaveObjectStrategy.js";
import { MsgStrategy } from "../Strategies/MsgStrategies/MsgStrategy.js";
import { MsgStrategyFactory } from "../Strategies/MsgStrategies/MsgStrategyFactory.js";
import { ObjectStrategy } from "../Strategies/MsgStrategies/ObjectStrategy.js";
import { PeersStrategy } from "../Strategies/MsgStrategies/PeersStrategy.js";
import { UnknownMsgStrategy } from "../Strategies/MsgStrategies/UnknownMsgStrategy.js";



@injectable()
export class MessageManager implements IMessageProvider{
    peerProvider: IPeerProvider;
    last_message: string;
    encoding: BufferEncoding;

    constructor(peerProivder: IPeerProvider){
        this.peerProvider = peerProivder;
        this.last_message = "";
        this.encoding = "utf-8";
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
        if (msg["type"] !== "hello" && this.peerProvider.FindPeer(peer.host, peer.port) === undefined){
          peer.SendError();
          console.log(GetLog(ErrorLocal["Runtime Peer Handshake"]))
          peer.socket.destroy();
          return false;
        }
        return true;
      }
    
      
    ParseMessages(msgs: string[], openConnection:OpenConnection): MsgStrategy[] {
        console.log(GetLog(RuntimeLocal["Node Parse"]))
        var strats:MsgStrategy[] = []
        var stratFactory = new MsgStrategyFactory(openConnection, msg);
        for(let m of msgs) {
          console.log(m)
          var msg = JSON.parse(m);
          stratFactory.SetMsg(msg);
          var keys: string[] = Object.keys(msg)
          if (! this.#CheckType(keys)) return [];
          // not handshake and first message
          if (!openConnection.isHandshaked && ! this.#CheckHandshake(msg, openConnection)) return [];  
          var msgStrat = this.ParseMessage(msg, openConnection, stratFactory);
          if(msgStrat === undefined)
          {
            console.log(ErrorLocal["Runtime Parse Error"] + JSON.stringify(msg));
            return [];
          }
          else
            strats.push(msgStrat);
        }
        return strats;
      }

      ParseMessage(msg: any, openConnection: OpenConnection, stratFactory: MsgStrategyFactory): MsgStrategy | undefined{
        var msgStrat;
        switch(msg["type"]) 
        {
          case "hello":
            openConnection.isHandshaked = true;
            msgStrat = stratFactory.CreateStrategy(HandShakeStrategy.name);
            break;
          case "getpeers":
            msgStrat = stratFactory.CreateStrategy(GetPeersStrategy.name);
            break;
          case "peers":
            msgStrat = stratFactory.CreateStrategy(PeersStrategy.name);
            break;
          case "ihaveobject":
              msgStrat = stratFactory.CreateStrategy(IHaveObjectStrategy.name);
              break;
          case "object":
              msgStrat = stratFactory.CreateStrategy(ObjectStrategy.name);
              break;
          case "getobject":
              msgStrat = stratFactory.CreateStrategy(GetObjectStrategy.name);
              break;
          case "error":
              msgStrat = stratFactory.CreateStrategy(ErrorStrategy.name);
              break;
          default:
            msgStrat = stratFactory.CreateStrategy(UnknownMsgStrategy.name);
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