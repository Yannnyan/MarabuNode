import { IUTXOSetProvider } from "../API/Services/IUTXOSetProvider.js";
import { Address } from "../Models/Address.js";
import { Outpoint } from "../Models/Outpoint.js";
import { Output } from "../Models/Output.js";
import { Transaction } from "../Models/Transaction.js";
import { container } from "./NodeContainerService.js";
import { Block } from "../Models/Block.js";



export class UTXOManager implements IUTXOSetProvider {
    UTXOS: Transaction[];
    myAddress: Address;

    constructor(myAddress: Address) {
        this.UTXOS = [];
        this.myAddress = myAddress;
    }

    ExecuteTransaction(tx: Transaction) {
        // get the transaction spend value
        var spendValue = tx.GetOutputSum();
        for(let input of tx.inputs) {
            let utxo: Transaction | undefined = this.UTXOS.find((TX) => TX.GetID() === input.outpoint.txid);
            if(!utxo) throw new Error("Transaction " + input.outpoint.txid + " is not UTXO");
            spendValue = this.Spend(utxo.outputs[input.outpoint.index], spendValue);
        }
    }

    async ComputeUTXOSet(block: Block) {
        await block.Verify();
        for(let txid of block.txids) {
            let utxo: Transaction | undefined = this.UTXOS.find((TX) => TX.GetID() === txid);
            if (!utxo) throw new Error("Transaction is not an unspent transaction");
            await utxo.Verify(container[this.myAddress.toString()].DBConProvider.appObj);
            this.ExecuteTransaction(utxo);
        }
    }
    GetUtxoSet(): Transaction[] {
        return this.UTXOS;
    }


    Spend(output: Output, value: number) : number {
        if(output.value >= value) {
            output.value - value;
            return 0;
        }
        else {
            value -= output.value
            return value;
        }
    }


}




