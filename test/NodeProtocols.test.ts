import { MarabuNode } from "../MarabuNode.js";
import { ApplicationObject } from "../Models/ApplicationObject.js";
import { OpenConnection } from "../Models/OpenConnection.js";
import { it } from "node:test";

describe("Testing Node Protocols", () => {
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
    it("Testing Node Discovery Protocol", () => {

    });
    it("Testing Gossiping Protocol", () => {

    });
    
    
    })
    
})