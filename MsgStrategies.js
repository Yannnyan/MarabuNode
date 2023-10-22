"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeersStrategy = exports.GetPeersStrategy = exports.HandShakeStrategy = exports.MsgStrategy = void 0;
const ErrorLocal_json_1 = __importDefault(require("./Localization/ErrorLocal.json"));
const RuntimeLocal_json_1 = __importDefault(require("./Localization/RuntimeLocal.json"));
const RuntimeLocal_1 = require("./Localization/RuntimeLocal");
const Address_1 = require("./Models/Address");
class MsgStrategy {
    constructor(peer, peerManager, connectionManager, msg) {
        this.peer = peer;
        this.peerManager = peerManager;
        this.connectionManager = connectionManager;
        this.msg = msg;
    }
    CheckVersion(msg) {
        if (this.valid_peer_version !== undefined)
            return this.valid_peer_version;
        if (msg === undefined) {
            return false;
        }
        var version = msg["version"]; // check version of the node
        if (!version.startsWith("0.8")) {
            console.log(ErrorLocal_json_1.default["Runtime Wrong Agent Version"]);
            this.valid_peer_version = false;
        }
        else {
            this.valid_peer_version = true;
        }
        return this.valid_peer_version;
    }
    CheckHasPeers(msg) {
        try {
            var peers = msg['peers'];
            if (peers.length === 0) {
                return [];
            }
            else {
                return peers;
            }
        }
        catch (error) {
            console.log(ErrorLocal_json_1.default["Runtime Wrong Message Format"]);
            return [];
        }
    }
}
exports.MsgStrategy = MsgStrategy;
class HandShakeStrategy extends MsgStrategy {
    HandleMessage() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default['Node HandShake'] + " " + JSON.stringify(this.msg)));
        if (!this.CheckVersion(this.msg)) {
            // invalid peer, need to ignore the message
            this.peer.socket.destroy();
            return;
        }
        // if we already have the peer then ignore the hello message
        if (this.peerManager.FindPeer(this.peer.host, this.peer.port) !== undefined) {
            return;
        }
        this.peerManager.AddPeer(this.peer);
        if (!this.peer.isClient) {
            this.peer.SendHello();
        }
        this.peer.SendGetPeers();
    }
}
exports.HandShakeStrategy = HandShakeStrategy;
class GetPeersStrategy extends MsgStrategy {
    HandleMessage() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default['Node GetPeers']));
        this.peer.SendPeers(this.peerManager.GetPeers());
    }
}
exports.GetPeersStrategy = GetPeersStrategy;
class PeersStrategy extends MsgStrategy {
    HandleMessage() {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default['Node Peers']));
        var peers = this.CheckHasPeers(this.msg);
        var addresses = peers.map((s) => Address_1.Address.CreateAddressFromString(s));
        addresses = addresses.filter((address) => !this.connectionManager.CheckIsMe(address) && this.peerManager.FindPeer(address.host, address.port) === undefined);
        this.connectionManager.AddPeersFromAddresses(addresses);
        this.peerManager.AddAddresses(addresses);
    }
}
exports.PeersStrategy = PeersStrategy;
