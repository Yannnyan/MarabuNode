import { isMainThread, parentPort, workerData } from "worker_threads";
import { MiningStrategy } from "../Strategies/MiningStrategy/MiningStrategy.js";
import { Address } from "./Address.js";
import { ClassicMiningStrategy } from "../Strategies/MiningStrategy/ClassicMiningStrategy.js";
import { BlockTemplate } from "./BlockTemplate.js";
import { exit } from "process";



export class Miner {
    miningStrategy: MiningStrategy;
    myAddress: Address;
    constructor(miningStrategy: MiningStrategy, myAddress: Address) {
        this.miningStrategy = miningStrategy;
        this.myAddress = myAddress;
    }
}

if(!isMainThread){
    

    parentPort?.addListener("message", async (msg) => {
        var template = new BlockTemplate(workerData.address, workerData.note, workerData.miner, workerData.T, workerData.maxTxs, msg.previd)
        var strategy = new ClassicMiningStrategy(workerData.address, template, msg.txids);
        if(msg.type === "start"){
            console.log("Starting miner");
            var miner = new Miner(strategy, workerData.address);
            var block = await miner.miningStrategy.Mine()
            parentPort?.postMessage(block);
        }
        if(msg.type === "updatetxids") {
            strategy.UpdateTxids(msg.txids);
        }
        
    })
    parentPort?.addListener("messageerror", () => {
        console.log("exiting")
        exit(1);
    })
    parentPort?.addListener("close", () => {

    })
}




