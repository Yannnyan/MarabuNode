import { MsgStrategy } from "./MsgStrategy.js"
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";


export class GetPeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        container[this.address.toString()].logger.Log(RuntimeLocal["Strategy GetPeers"])
        this.peer.SendPeers(container[this.address.toString()].peerProvider.GetPeers())
    }
}
