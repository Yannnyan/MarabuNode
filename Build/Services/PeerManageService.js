"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _PeerManager_instances, _PeerManager_UpdatePeers;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerManager = void 0;
const Peers_json_1 = __importDefault(require("../Messages/Peers.json"));
const OpenConnection_1 = require("../Models/OpenConnection");
class PeerManager {
    constructor(adress) {
        _PeerManager_instances.add(this);
        this.openConnections = [];
        this.peerList = [adress];
        this.peerMsg = { "type": Peers_json_1.default.type, "peers": Peers_json_1.default.peers };
    }
    AddPeers(peers) {
        this.openConnections.push(...peers);
        __classPrivateFieldGet(this, _PeerManager_instances, "m", _PeerManager_UpdatePeers).call(this);
    }
    AddAddress(address) {
        this.peerList.push(address);
    }
    AddAddresses(addresses) {
        this.peerList.push(...addresses);
    }
    AddPeerFromSocket(socket, isClient) {
        var peer = new OpenConnection_1.OpenConnection(socket, isClient);
        if (this.FindPeer(peer.host, peer.port) === undefined) {
            return;
        }
        __classPrivateFieldGet(this, _PeerManager_instances, "m", _PeerManager_UpdatePeers).call(this);
    }
    AddPeer(peer) {
        if (this.FindPeer(peer.host, peer.port) !== undefined) {
            return false;
        }
        this.openConnections.push(peer);
        __classPrivateFieldGet(this, _PeerManager_instances, "m", _PeerManager_UpdatePeers).call(this);
        return true;
    }
    GetPeers() {
        return this.peerMsg;
    }
    FindPeer(host, port, socket) {
        if ((socket === undefined && (host === undefined || port === undefined))) {
            return undefined;
        }
        if (socket === undefined) {
            return this.peerList.find((peer) => peer.port === port && peer.host === host);
        }
        else {
            if (socket.remotePort === undefined || socket.remoteAddress === undefined) {
                return undefined;
            }
            return this.peerList.find((peer) => peer.port === socket.remotePort && peer.host === socket.remoteAddress);
        }
    }
}
exports.PeerManager = PeerManager;
_PeerManager_instances = new WeakSet(), _PeerManager_UpdatePeers = function _PeerManager_UpdatePeers() {
    var lst = this.peerList.map((address) => address.host + ":" + address.port.toString());
    this.peerMsg.peers = lst;
    // fs.open('../Discovery/KnownPeers.json', (err,fd) => {
    //     fs.writeFile(fd, new Uint8Array(Buffer.from(JSON.stringify(KnownPeers))),()=>{});
    // });
};
