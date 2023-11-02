import { Address } from "../../Models/Address.js";
import { MsgStrategy } from "./MsgStrategy.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json' assert { type: "json" };
import { container } from "../../Services/NodeContainerService.js";


export class PeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        container[this.address.toString()].logger.Log(RuntimeLocal["Strategy GetPeers"])
        var peers = this.CheckHasPeers(this.msg);
        var addresses = peers.map((s) => Address.CreateAddressFromString(s));
        var nodeCont = container[this.address.toString()];
        addresses = addresses.filter(
            (address) => !nodeCont.conProvider.CheckIsMe(address) && nodeCont.peerProvider.FindServer(address.host, address.port) === undefined
        );
        nodeCont.conProvider.AddPeersFromAddresses(addresses);
    }
    
}