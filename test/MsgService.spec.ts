import connectMongo from "../config/mongoose.js"
import { MarabuNode } from "../MarabuNode.js"
import { MessageManager } from "../Services/MessageManageService.js";
import { PeerManager } from "../Services/PeerManageService.js";
import { ConnectionManager } from "../Services/ConnectionManageService.js";
import HelloMsg from '../Messages/Hello.json' assert { type: "json" };
import GetPeerMsg from '../Messages/GetPeers.json' assert { type: "json" };
import GetObjectMsg from '../Messages/GetObject.json' assert { type: "json" };
import PeersMsg from '../Messages/Peers.json' assert { type: "json" };
import IHaveObjectMsg from '../Messages/IHaveObject.json' assert { type: "json" };
import ErrorMsg from '../Messages/Error.json' assert { type: "json" };
import {ApplicationObject} from '../Models/ApplicationObject.js';

import { Address } from "../Models/Address.js";
import { OpenConnection } from "../Models/OpenConnection.js" ;
import * as net from 'net'
import { ErrorStrategy, GetObjectStrategy, GetPeersStrategy, HandShakeStrategy, IHaveObjectStrategy, MsgStrategy, PeersStrategy, UnknownMsgStrategy } from "../MsgStrategies.js";
import {assert,should, expect} from "chai";
import { it } from "node:test";
import { describe} from "node:test";

import serialize from "canonicalize"



var host = "127.0.0.1"
var port = 18019
var def_port = 18018


var conPort1 = connectMongo(def_port);
var conPort2 = connectMongo(port);

console.log(typeof(serialize))

let address = new Address( "localhost",18019);

var peerManager = new PeerManager(address)
var messageManager = new MessageManager(peerManager);
var connectionManager = new ConnectionManager(peerManager,messageManager, "localhost",18019);
messageManager.SetConnectionManager(connectionManager);

describe("testing message manager", () => {
    var socket = new net.Socket()
    it("Test Message parsing", (t,done) => {
        socket.connect({port: port, host: host}, function() {
            var peer = new OpenConnection(socket,true);
            var msgs: string[] = [JSON.stringify(HelloMsg), JSON.stringify(GetPeerMsg),
                                 JSON.stringify(IHaveObjectMsg), JSON.stringify(PeersMsg), JSON.stringify(GetObjectMsg),
                                JSON.stringify(ErrorMsg), JSON.stringify({"type": "xd"})];
            var strategies: MsgStrategy[] = messageManager.ParseMessages(msgs, peer);
            var getmsg =  (i: number, name: string) => i.toString() + " th message should be " + name;
            var names: string[] = [HandShakeStrategy.name,GetPeersStrategy.name,IHaveObjectStrategy.name,
                PeersStrategy.name,GetObjectStrategy.name,ErrorStrategy.name,UnknownMsgStrategy.name]
            for(let i=0; i < msgs.length; i++) {
                assert.equal(strategies[i].constructor.name,names[i], getmsg(i,names[i]));
            }
            setImmediate(done);

        })
    })
    it("Test ApplicationObject", async (t,done) => {
        var coinbaseTx: any = {"object":{"height":0,"outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":50000000000}],"type":"transaction"},"type":"object"}

        var nextTransaction:any = {"object":{"inputs":[{"outpoint":{"index":0,
        "txid":"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af"},
        "sig":"1d0d7d774042607c69a87ac5f1cdf92bf474c25fafcc089fe667602bfefb0494726c519e92266957429ced875256e6915eb8cea2ea66366e739415efc47a6805"}],
        "outputs":[{"pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":10}],"type":"transaction"},"type":"object"}

        assert.doesNotThrow(() => ApplicationObject.Parse(coinbaseTx), "Parsing legal string not throws")
        var obj: ApplicationObject = ApplicationObject.Parse(coinbaseTx);
        assert.equal(serialize(coinbaseTx), obj.ToString(), "converting the object back to string must be the same")

        assert.doesNotThrow(() => ApplicationObject.Parse(nextTransaction), "Parsing legal string not throws")
        var nextTx: ApplicationObject = ApplicationObject.Parse(nextTransaction);
        assert.equal(serialize(nextTransaction), nextTx.ToString(), "converting the object back to string must be the same")
        
        assert.equal(obj.GetID(),"1bb37b637d07100cd26fc063dfd4c39a7931cc88dae3417871219715a5e374af","id must match getid functionality to given id")
        // await obj.Verify();
        try{
            await obj.Verify();
            console.log(await obj.Save());
        }
        catch(err: any) {
            assert.fail(err.message);
        }
        try {
            await nextTx.Verify();
        }
        catch (err: any){
            assert.fail(err)
        }

        // setImmediate(done);
    })
})

describe("Testing Node Protocols", () => {
    var node = new MarabuNode();
    var node2 = new MarabuNode(port, host);
    node.conProvider.ListenToConnections()
    node2.conProvider.ListenToConnections()
    // node2.BootstrapDiscovery();
    var socket = new net.Socket();
    socket.connect({"host": node.host, "port": node.port}, function() {
        var senderPeer = new OpenConnection(socket, true);
        socket.on("data", (data:Buffer) => {
            try {
                node2.msgProvider.GetMessage(data, senderPeer);
            }
            catch(error) {
                console.log(error);
                senderPeer.SendError();
            }
        })
        var tx = {"object":{"height":0,"outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":50000000000}],"type":"transaction"},"type":"object"}
        var obj = ApplicationObject.Parse(tx);
        if(senderPeer !== undefined)
        {
            senderPeer.SendHello()
            senderPeer.SendGetPeers()
            senderPeer.SendIHaveObject(obj.GetID());
        }
    
    })
    
})
