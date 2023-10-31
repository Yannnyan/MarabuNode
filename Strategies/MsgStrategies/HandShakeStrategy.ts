import { GetLog } from "../../Localization/RuntimeLocal.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json'
import { MsgStrategy } from "./MsgStrategy.js";


export class HandShakeStrategy extends MsgStrategy{

    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node HandShake'] + " " + JSON.stringify(this.msg)))
        if (!this.CheckVersion(this.msg)) {
            // invalid peer, need to ignore the message
            this.peer.socket.destroy();
            return;
        }
        // if we already have the peer then ignore the hello message
        if(this.peerManager.FindPeer(this.peer.host, this.peer.port) !== undefined)
        {
            return;
        }
        this.peerManager.AddPeer(this.peer);
        if(!this.peer.isClient){
            this.peer.SendHello();
        }
        this.peer.SendGetPeers();
    }
}
  