import {Worker, isMainThread, parentPort, threadId} from "worker_threads"



if(isMainThread) {
    var worker = new Worker("./something.js")
    worker.addListener("message", (msg) => {
        console.log(threadId)
        console.log(process.pid)
        console.log("ok lets go");
    })
    worker.postMessage("fine");
}
else {
    if(parentPort){
        parentPort.postMessage("random");
        parentPort.addListener("message", (msg) => {
            console.log(threadId)
            console.log(process.pid);
            console.log("ok guys lets go");
        })
    }
    else
        console.log("null")
}




