import { MessageManager } from "../Services/MessageManageService";
import { PeerManager } from "../Services/PeerManageService";
import { ConnectionManager } from "../Services/ConnectionManageService";
import HelloMsg from '../Messages/Hello.json';
import GetPeerMsg from '../Messages/GetPeers.json';
import { Address } from "../Models/Address";
import { OpenConnection } from "../Models/OpenConnection";
import * as net from 'net'
import { MsgStrategy } from "../MsgStrategies";

let address = new Address( "localhost",18019);

var peerManager = new PeerManager(address)
var messageManager = new MessageManager(peerManager);
var connectionManager = new ConnectionManager(peerManager,messageManager, "localhost",18019);
messageManager.SetConnectionManager(connectionManager);

// describe("testing message manager", () => {
//     test("", () => {
var socket = new net.Socket()
socket.connect({port: 18018, host: "localhost"}, function() {
    var peer = new OpenConnection(socket,true);
    var msgs: string[] = [JSON.stringify(HelloMsg), JSON.stringify(GetPeerMsg)]
    var parsed = messageManager.ParseMessages(msgs, peer);
    if(parsed === undefined){
        return;
    }
    console.log(parsed)
    for(let strat of parsed) {
        strat.HandleMessage()
    }

})
socket.on("data", function(data: Buffer) {
    console.log("Recieving Data: " + data.toString("utf-8"))
})
//     })
// })

