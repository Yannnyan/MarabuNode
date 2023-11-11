import { container } from "../../Services/NodeContainerService.js";
import { MsgStrategy } from "./MsgStrategy.js";
import EVENTS from '../../Events/Events.json' assert {type: "json"};

export class ChainTipStrategy extends MsgStrategy {
    HandleMessage(): void {
        var blockid = this.msg["blockid"];
        container[this.address.toString()].eventEmitter.emit(EVENTS.CHAINTIP_UPDATE, blockid);
    }
    
}









