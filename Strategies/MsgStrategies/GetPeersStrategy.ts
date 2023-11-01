import { MsgStrategy } from "./MsgStrategy.js"
import { GetLog } from "../../Localization/RuntimeLocal.js"
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";


export class GetPeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node GetPeers']))
        this.peer.SendPeers(container[this.address.toString()].peerProvider.GetPeers())
    }
}
