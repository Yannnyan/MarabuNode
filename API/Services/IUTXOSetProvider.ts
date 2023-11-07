import { Block } from "../../Models/Block.js";
import { Transaction } from "../../Models/Transaction.js";



export interface IUTXOSetProvider {

    ExecuteTransaction(tx: Transaction): void;
    ComputeUTXOSet(block: Block): Promise<void>;
    GetUtxoSet(): Transaction[];

}