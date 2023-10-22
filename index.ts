import { MarabuNode } from "./MarabuNode"

var port = process.argv.length >= 3 ? Number.parseInt(process.argv[2]) : undefined
var node: MarabuNode = new MarabuNode(port)

node.Start()


