import { MarabuNode } from "../MarabuNode.js";
import { ApplicationObject } from "../Models/ApplicationObject.js";
import { OpenConnection } from "../Models/OpenConnection.js";
import { it } from "node:test";
import * as net from "net";
import { describe } from "node:test";


var node = new MarabuNode("127.0.0.1", 18018);
var node1 = new MarabuNode("127.0.0.1", 18019);


describe("Testing Node Protocols", () => {
    node.conProvider.ListenToConnections()
    node1.conProvider.ListenToConnections()
    // node2.BootstrapDiscovery();
    var socket = new net.Socket();

    socket.connect({"host": node.address.host, "port": node.address.port}, function() {
        var senderPeer = new OpenConnection(socket, true, node.address);
        node1.peerProvider.AddOpenConnection(senderPeer);
        node1.peerProvider.AddAddress(node.address);

        socket.on("data", (data:Buffer) => {
            try {
                node1.msgProvider.GetMessage(data, senderPeer);
            }
            catch(error) {
                console.log(error);
                senderPeer.SendError();
            }
        })

        var tx = {"object":{"height":0,"outputs":[{
            "pubkey":"8dbcd2401c89c04d6e53c81c90aa0b551cc8fc47c0469217c8f5cfbae1e911f9",
            "value":50000000000}],"type":"transaction"},"type":"object"}
        
        var obj = ApplicationObject.Parse(tx, node1.address);
        if(senderPeer !== undefined)
        {
            senderPeer.SendHello()
            senderPeer.SendGetPeers()
            senderPeer.SendIHaveObject(obj.GetID());
        }
    it("Testing Node Discovery Protocol", () => {

    });
    it("Testing Gossiping Protocol", () => {

    });
    
    
    })
    
})