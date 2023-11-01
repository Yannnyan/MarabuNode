import { OpenConnection } from "../Models/OpenConnection.js" ;
import * as net from 'net'

import {assert,should, expect} from "chai";
import { it } from "node:test";
import { describe} from "node:test";

import { ErrorStrategy } from "../Strategies/MsgStrategies/ErrorStrategy.js";
import { GetObjectStrategy } from "../Strategies/MsgStrategies/GetObjectStrategy.js";
import { GetPeersStrategy } from "../Strategies/MsgStrategies/GetPeersStrategy.js";
import { HandShakeStrategy } from "../Strategies/MsgStrategies/HandShakeStrategy.js";
import { IHaveObjectStrategy } from "../Strategies/MsgStrategies/IHaveObjectStrategy.js";
import { MsgStrategy } from "../Strategies/MsgStrategies/MsgStrategy.js";
import { PeersStrategy } from "../Strategies/MsgStrategies/PeersStrategy.js";
import { UnknownMsgStrategy } from "../Strategies/MsgStrategies/UnknownMsgStrategy.js";

import HelloMsg from '../Messages/Hello.json' assert { type: "json" };
import GetPeerMsg from '../Messages/GetPeers.json' assert { type: "json" };
import GetObjectMsg from '../Messages/GetObject.json' assert { type: "json" };
import PeersMsg from '../Messages/Peers.json' assert { type: "json" };
import IHaveObjectMsg from '../Messages/IHaveObject.json' assert { type: "json" };
import ErrorMsg from '../Messages/Error.json' assert { type: "json" };
import { MarabuNode } from "../MarabuNode.js";
import { container } from "../config/NodeObjectsContainer.js";
import { MessageManager } from "../Services/MessageManageService.js";



var port = 18018
var host = "127.0.0.1"

var node = new MarabuNode(host, port);

describe("testing message manager", () => {

    it("Test Message parsing", (t,done) => {
        var socket = new net.Socket();
    
        socket.connect({host: host, port: port}, () => {

            console.log(socket)
            var peer: OpenConnection = new OpenConnection(socket, true);
            
            var msgs: string[] = [JSON.stringify(HelloMsg), JSON.stringify(GetPeerMsg),
                                    JSON.stringify(IHaveObjectMsg), JSON.stringify(PeersMsg), JSON.stringify(GetObjectMsg),
                                    JSON.stringify(ErrorMsg), JSON.stringify({"type": "xd"})];
            var msgProvider = <MessageManager> node.msgProvider;
            var strategies: MsgStrategy[] = msgProvider.ParseMessages(msgs, peer);
            var getmsg =  (i: number, name: string) => i.toString() + " the message should be " + name;
            
            var names: string[] = [HandShakeStrategy.name,GetPeersStrategy.name,IHaveObjectStrategy.name,
                                    PeersStrategy.name,GetObjectStrategy.name,ErrorStrategy.name,UnknownMsgStrategy.name]
            
            for(let i=0; i < msgs.length; i++) {
                assert.equal(strategies[i].constructor.name,names[i], getmsg(i,names[i]));
            }
            setImmediate(done);
        });

    })
    
})

