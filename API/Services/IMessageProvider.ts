import { OpenConnection } from "../../Models/OpenConnection.js";

export interface IMessageProvider {
    /**
     * Handles a given message from another peer, given the connection and the buffer.
     * @param msg 
     * @param peer 
     * @returns 
     */
    GetMessage: (msg: Buffer, peer: OpenConnection) => void;

}


