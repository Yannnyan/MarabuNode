import { MsgStrategy } from "./MsgStrategy.js";
import { ApplicationObject } from "../../Models/ApplicationObject.js";
import { PeerManager } from "../../Services/PeerManageService.js";
import { GetLog } from "../../Localization/RuntimeLocal.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { IPeerProvider } from "../../API/Services/IPeerProvider.js";



export class ObjectStrategy extends MsgStrategy {
    static Gossip(obj: ApplicationObject, peerManager: IPeerProvider) {
        for(let peer of peerManager.GetOpenConnections()) {
            peer.SendIHaveObject(obj.GetID())
        }
    }

    HandleMessage(): void {
        let obj = ApplicationObject.Parse(this.msg);

        console.log(GetLog(RuntimeLocal['Node Object'] + " " + obj.ToString()))
        // validify object dont forget
        ApplicationObject.FindById(obj.GetID()).then((found) => {
            if (found === undefined) {
                try{
                    obj.Verify();
                }
                catch(err) {
                    console.log(err);
                    this.peer.SendError();
                    return;
                }
                obj.Save();
                ObjectStrategy.Gossip(obj,this.peerManager);
            }
        })
    }
}