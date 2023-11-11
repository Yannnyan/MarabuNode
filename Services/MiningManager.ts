import { Address } from "../Models/Address.js";
import { BlockTemplate } from "../Models/BlockTemplate.js";
import { MiningStrategy } from "../Strategies/MiningStrategy/MiningStrategy.js";
import { container } from "./NodeContainerService.js";
import Events from '../Events/Events.json' assert {type: "json"};
import minerConfig from '../config/miner.config.json' assert {type: "json"};
import { Worker, isMainThread } from "worker_threads";
import { Block } from "../Models/Block.js";


export class MiningManager {
    myAddress: Address;
    numWorkers: number;
    workers: Worker[];
    workerData: any;
    
    constructor(myAddress: Address) {
        this.myAddress = myAddress;
        this.workerData = {
            address: this.myAddress,
            note: minerConfig.note,
            miner: minerConfig.miner,
            T: minerConfig.T,
            maxTxs: minerConfig.maxTxs
        }

        this.numWorkers = 8;
        this.workers = [];

        for(let i =0; i< this.numWorkers; i++){
            var worker = new Worker("C:\\Users\\Yan\\Desktop\\Projects\\Blockchain\\MarabuNode\\Build\\Models\\Miner.js", {workerData: this.workerData});
            worker.addListener("online", async () => {
                await this.StartWorker(worker);
            })
            worker.addListener("message", (block: Block) => {
                container[myAddress.toString()].eventEmitter.emit(Events.BLOCK_MINED, block);
                container[myAddress.toString()].marabuNode.BroadcastNewBlock(block);
            });
            worker.addListener("error", (err) => {
                console.log(err);

            })
            worker.addListener("exit", (exitcode) => {
                console.log("miner thread exit, " + exitcode);
            })
            this.workers.push(worker);
        }

        container[myAddress.toString()].eventEmitter.addListener(Events.MEMPOOL_UPDATE, async () => {
            var txids = await container[myAddress.toString()].mempoolProvider.GetTxs()
            this.UpdateWorkersTxids(txids);
        });
    }

    UpdateWorkersTxids(txids: Set<string>){
        for(let worker of this.workers) {
            worker.postMessage(txids);
        }
    }

    async StartWorker(worker: Worker) {
        var prev = container[this.myAddress.toString()].chainProvider.GetLongestChainTip()?.GetID()
        var txids = await container[this.myAddress.toString()].mempoolProvider.GetTxs()
        worker.postMessage({type: "start", previd: prev, txids: txids});

    }
}






