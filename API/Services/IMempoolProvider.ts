import { Block } from "../../Models/Block.js";

export interface IMempoolProvider {
    SetTransaction(tx: string): Promise<void> ;
    ApplyBlock(block: Block): Promise<void>;
    GetTxs() : Promise<Set<string>> ;
}