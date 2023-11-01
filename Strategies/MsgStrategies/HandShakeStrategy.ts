import { GetLog } from "../../Localization/RuntimeLocal.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";
import { MsgStrategy } from "./MsgStrategy.js";


export class HandShakeStrategy extends MsgStrategy{

    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node HandShake'] + " " + JSON.stringify(this.msg)))
        if (!this.CheckVersion(this.msg)) {
            // invalid peer, need to ignore the message
            container[this.address.toString()].peerProvider.RemoveOpenConnection(this.peer);
            return;
        }
        if(!this.peer.isClient){
            this.peer.SendHello();
        }
        this.peer.SendGetPeers();
    }
}
  