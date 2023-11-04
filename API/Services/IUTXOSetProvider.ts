import { Transaction } from "../../Models/Transaction.js";



export interface IUTXOSetProvider {

    ExecuteTransaction(tx: Transaction): void;
}