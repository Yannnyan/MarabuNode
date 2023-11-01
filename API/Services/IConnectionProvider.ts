import { Address } from "../../Models/Address.js";

export interface IConnectionProvider {
    address: Address;
    /**
     * Connect to the given address in a tcp socket from the instanciated host and port.
     * @param address 
     * @returns 
     */
    ConnectToAddress: (address: Address) => void;
    
    /**
     * 
     * @param address 
     * @returns 
     */
    CheckIsMe: (address: Address) => boolean;
    ListenToConnections: () => void;
    AddPeersFromAddresses: (addresses: Address[]) => void;

}