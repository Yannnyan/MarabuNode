

import { MsgStrategy } from "./MsgStrategy.js"


export class ErrorStrategy extends MsgStrategy {
    HandleMessage(): void {
        console.log("Got Error From node " + this.peer.myAddress.toString())
        console.log(this.msg);
        // throw new Error('Got Error From user.');
    }

}