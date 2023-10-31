
import { DBConnectionManager } from "../Services/DbConnectionManagerService.js";
import connectMongo from "./mongoose.js"
import { MarabuNode } from "../MarabuNode.js"
import {container} from "tsyringe" 
import { ConnectionManager } from "../Services/ConnectionManageService.js"
import { PeerManager } from "../Services/PeerManageService.js"
import { Address } from "../Models/Address.js"
import { MessageManager } from "../Services/MessageManageService.js"


/**
 * Registers new node
 */




var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined

var address = new Address('127.0.0.1', port || 18018);
container.register<DBConnectionManager>(DBConnectionManager, {useValue: new DBConnectionManager(address)})
container.register<PeerManager>(PeerManager, {useValue: new PeerManager(address)})
container.register<MessageManager>(MessageManager, {useValue: new MessageManager(container.resolve(PeerManager))})
container.register<ConnectionManager>(ConnectionManager, {useValue: new ConnectionManager(container.resolve(PeerManager),
    container.resolve(MessageManager), address.host, address.port)})
container.register<MarabuNode>(MarabuNode, {useValue: new MarabuNode(container.resolve(MessageManager), container.resolve(ConnectionManager),
    container.resolve(PeerManager), container.resolve(DBConnectionManager),port,'127.0.0.1')});


