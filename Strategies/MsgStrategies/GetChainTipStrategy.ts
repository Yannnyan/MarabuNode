import { MsgStrategy } from "./MsgStrategy.js";

import { container } from "../../Services/NodeContainerService.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";

export class GetChainTipStrategy extends MsgStrategy {

    HandleMessage(): void {
        var lct = container[this.address.toString()].chainProvider.GetLongestChainTip();
        if(!lct) throw new Error("INVALID_CHAINTIP");
        this.peer.SendChainTip(lct);
    }
    
}





