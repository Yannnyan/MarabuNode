import "reflect-metadata"

import "./config/tsyringe.config.js"
import { MarabuNode } from "./MarabuNode.js"
import {container} from "tsyringe" 

// var node: MarabuNode = new MarabuNode(port)
var node: MarabuNode = container.resolve(MarabuNode);

node.Start();
