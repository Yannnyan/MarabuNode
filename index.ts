import { MarabuNode } from "./MarabuNode"
import { mongoConnect } from "./config/mongoose"

var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined
var node: MarabuNode = new MarabuNode(port)



mongoConnect(node.port).then(function() {
  node.Start()
});
