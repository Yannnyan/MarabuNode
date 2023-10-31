import { MsgStrategy } from "./MsgStrategy.js";


export class UnknownMsgStrategy extends MsgStrategy {
    HandleMessage(): void {
        throw new Error('Method not implemented.');
    }
    
}
