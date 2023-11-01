
import "./config/mongoose.js"
import { MarabuNode } from "./MarabuNode.js"


var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : 18018
var host = "127.0.0.1"


var node: MarabuNode = new MarabuNode(host,port);


node.Start();
