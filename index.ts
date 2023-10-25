import connectMongo from "./config/mongoose.js"
import { MarabuNode } from "./MarabuNode.js"

var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined
var node: MarabuNode = new MarabuNode(port)


connectMongo(node.port);
node.Start();
