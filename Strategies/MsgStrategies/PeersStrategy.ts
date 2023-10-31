import { GetLog } from "../../Localization/RuntimeLocal.js";
import { Address } from "../../Models/Address.js";
import { MsgStrategy } from "./MsgStrategy.js";
import RuntimeLocal from '../../Localization/RuntimeLocal.json'


export class PeersStrategy extends MsgStrategy {
    
    HandleMessage(): void {
        console.log(GetLog(RuntimeLocal['Node Peers']))
        var peers = this.CheckHasPeers(this.msg);
        var addresses = peers.map((s) => Address.CreateAddressFromString(s));
        addresses = addresses.filter((address) =>
         !this.connectionManager.CheckIsMe(address) && this.peerManager.FindPeer(address.host, address.port) === undefined);
        this.connectionManager.AddPeersFromAddresses(addresses);
        this.peerManager.AddAddresses(addresses);
    }
    
}