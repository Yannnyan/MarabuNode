"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _MessageManager_instances, _MessageManager_CheckType, _MessageManager_CheckHandshake;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = void 0;
const ErrorLocal_json_1 = __importDefault(require("../Localization/ErrorLocal.json"));
const MsgStrategies_1 = require("../MsgStrategies");
const RuntimeLocal_json_1 = __importDefault(require("../Localization/RuntimeLocal.json"));
const RuntimeLocal_1 = require("../Localization/RuntimeLocal");
class MessageManager {
    constructor(peerManager, connectionManager) {
        _MessageManager_instances.add(this);
        this.peerManager = peerManager;
        this.last_message = "";
        this.connectionManager = connectionManager;
        this.encoding = "utf-8";
    }
    SetConnectionManager(connectionManager) {
        this.connectionManager = connectionManager;
    }
    ParseMessage(msgs, openConnection) {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Parse"]));
        if (this.connectionManager === undefined)
            throw new Error(ErrorLocal_json_1.default["Runtime instance not exists"]);
        var strats = [];
        for (let m of msgs) {
            var msg = JSON.parse(m);
            var keys = Object.keys(msg);
            if (!__classPrivateFieldGet(this, _MessageManager_instances, "m", _MessageManager_CheckType).call(this, keys))
                return [];
            // not handshake and first message
            if (!openConnection.isHandshaked && !__classPrivateFieldGet(this, _MessageManager_instances, "m", _MessageManager_CheckHandshake).call(this, msg, openConnection))
                return [];
            var msgStrat;
            switch (msg["type"]) {
                case "hello":
                    openConnection.isHandshaked = true;
                    msgStrat = new MsgStrategies_1.HandShakeStrategy(openConnection, this.peerManager, this.connectionManager, msg);
                    break;
                case "getPeers":
                    msgStrat = new MsgStrategies_1.GetPeersStrategy(openConnection, this.peerManager, this.connectionManager, msg);
                    break;
                case "peers":
                    msgStrat = new MsgStrategies_1.PeersStrategy(openConnection, this.peerManager, this.connectionManager, msg);
                    break;
            }
            if (msgStrat === undefined) {
                console.log(ErrorLocal_json_1.default["Runtime Parse Error"]);
                return [];
            }
            else
                strats.push(msgStrat);
        }
        return strats;
    }
    DivideMessage(msg) {
        var msgs = msg.split("\n");
        if (msgs.at(-1) === "") {
            msgs.pop();
        }
        if (msgs.at(-1) === undefined) {
            return [];
        }
        // concatenate message from previous break
        if (this.last_message !== "") {
            msgs[0] = this.last_message + msgs[0];
            this.last_message = "";
        }
        if (!msg.endsWith("\n")) {
            this.last_message = msgs[msgs.length - 1];
            msgs.pop();
        }
        return msgs;
    }
    GetMessage(msg, peer) {
        console.log((0, RuntimeLocal_1.GetLog)(RuntimeLocal_json_1.default["Node Data"]) + msg.toString(this.encoding));
        var msgStrats = this.ParseMessage(this.DivideMessage(msg.toString(this.encoding)), peer);
        msgStrats === null || msgStrats === void 0 ? void 0 : msgStrats.forEach((strat) => strat.HandleMessage());
    }
}
exports.MessageManager = MessageManager;
_MessageManager_instances = new WeakSet(), _MessageManager_CheckType = function _MessageManager_CheckType(keys) {
    var type = keys.find((some) => some === "type");
    if (type === undefined) {
        console.log(ErrorLocal_json_1.default["Runtime Wrong Message Format"]);
        return false;
    }
    return true;
}, _MessageManager_CheckHandshake = function _MessageManager_CheckHandshake(msg, peer) {
    if (msg["type"] !== "hello" && this.peerManager.FindPeer(peer.host, peer.port) === undefined) {
        peer.SendError();
        console.log((0, RuntimeLocal_1.GetLog)(ErrorLocal_json_1.default["Runtime Peer Handshake"]));
        peer.socket.destroy();
        return false;
    }
    return true;
};
