import { OpenConnection } from "../Models/OpenConnection.js";
import ErrorLocal from '../Localization/ErrorLocal.json' assert { type: "json" };;
import RuntimeLocal from '../Localization/RuntimeLocal.json' assert { type: "json" };
import { IMessageProvider } from "../API/Services/IMessageProvider.js";
import { IPeerProvider } from "../API/Services/IPeerProvider.js";
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
import { Address } from "../Models/Address.js";
import { container } from "./NodeContainerService.js";


export class MessageManager implements IMessageProvider{
    peerProvider?: IPeerProvider;
    last_message: string;
    encoding: BufferEncoding;
    address: Address;

    constructor(address: Address){
        this.last_message = "";
        this.encoding = "utf-8";
        this.address = address;
    }

    #SetPeerProvider() {
      this.peerProvider = container[this.address.toString()].peerProvider;
    }
    #CheckType(keys: string[]) {
        var type = keys.find((some:string) => some === "type");
        if(type === undefined){
          container[this.address.toString()].logger.Log(ErrorLocal["Runtime Wrong Message Format"]);
            return false;
        }
        return true;
        }
    
      #CheckHandshake(msg: any, peer:OpenConnection) {
        if (msg["type"] !== "hello" && !peer.isHandshaked){
          peer.SendError();
          container[this.address.toString()].logger.Log(ErrorLocal["Runtime Peer Handshake"])
          return false;
        }
        return true;
      }
    
      
    ParseMessages(msgs: string[], openConnection: OpenConnection): MsgStrategy[] {
        container[this.address.toString()].logger.Log(RuntimeLocal.Parse)
        if (!this.peerProvider) this.#SetPeerProvider();
        if( !this.peerProvider) throw new Error("peer provider undefined");

        var factory = this.peerProvider.GetConFactoryMap().get(openConnection);
        if(!factory) {
          container[this.address.toString()].logger.Log("factory undefined " + openConnection.remoteAddress.toString());
          return [];
        }
        var strats:MsgStrategy[] = []
        for(let m of msgs) {
          console.log(m)
          var msg = JSON.parse(m);
          var keys: string[] = Object.keys(msg)
          if (! this.#CheckType(keys)) return [];
          // not handshake and first message
          if (! this.#CheckHandshake(msg, openConnection)) return []; 
          var msgStrat = this.ParseMessage(msg, factory);
          if(msgStrat !== undefined)
          {
            strats.push(msgStrat);
          }
        }
        return strats;
      }

      ParseMessage(msg: any, stratFactory: MsgStrategyFactory): MsgStrategy | undefined{
        var msgStrat;
        switch(msg["type"]) 
        {
          case "hello":
            if(stratFactory.peer.isHandshaked){
              // if we already have the peer then ignore the hello message
                return undefined;
            }
            stratFactory.peer.isHandshaked = true;
            msgStrat = stratFactory.CreateStrategy(HandShakeStrategy.name, msg);
            break;
          case "getpeers":
            msgStrat = stratFactory.CreateStrategy(GetPeersStrategy.name, msg);
            break;
          case "peers":
            msgStrat = stratFactory.CreateStrategy(PeersStrategy.name, msg);
            break;
          case "ihaveobject":
              msgStrat = stratFactory.CreateStrategy(IHaveObjectStrategy.name, msg);
              break;
          case "object":
              msgStrat = stratFactory.CreateStrategy(ObjectStrategy.name, msg);
              break;
          case "getobject":
              msgStrat = stratFactory.CreateStrategy(GetObjectStrategy.name, msg);
              break;
          case "error":
              msgStrat = stratFactory.CreateStrategy(ErrorStrategy.name, msg);
              break;
          default:
            msgStrat = stratFactory.CreateStrategy(UnknownMsgStrategy.name, msg);
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
        container[this.address.toString()].logger.Log(RuntimeLocal.Data);
        var pendReqProvider = container[this.address.toString()].pendingRequestProvider
        var msgStrats = this.ParseMessages(this.DivideMessage(msg.toString(this.encoding)), peer)
        msgStrats?.forEach((strat) => strat.HandleMessage());
        msgStrats?.forEach((strat) => pendReqProvider.GetMsgStrategy(strat));
      }
}