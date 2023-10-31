

import { MsgStrategy } from "./MsgStrategy.js"


export class ErrorStrategy extends MsgStrategy {
    HandleMessage(): void {
        console.log("Got Error From user")
        // throw new Error('Got Error From user.');
    }

}