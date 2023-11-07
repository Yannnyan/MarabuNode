import { container } from "../../Services/NodeContainerService.js";
import { MsgStrategy } from "./MsgStrategy.js";


export class ChainTipStrategy extends MsgStrategy {
    HandleMessage(): void {
        var blockid = this.msg["blockid"];
        container[this.address.toString()].chainProvider.UpdateTip(blockid);
    }
    
}









