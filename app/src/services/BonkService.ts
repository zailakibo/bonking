import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from '@solana/web3.js'
import { ProgramService } from "./ProgramService";
import { Buffer } from 'buffer';
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { TokenAccountService } from "./TokenAccountService";

type BonkArgs = {
    connection: Connection,
    wallet: any,
    bonkingAddress: PublicKey,
}

type FindBonkArgs = BonkArgs & {
    number: number
}

export class BonkService {

    static async findBonkByBonkingAddressAndNumber({ connection, wallet, bonkingAddress, number }: FindBonkArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonkAddress = BonkService.bonkPDA(bonkingAddress, number);
        return program.account.bonk.fetch(bonkAddress);
    }

    static bonkPDA(bonking: PublicKey, number: number) {
        const bonkingBuffer = bonking.toBuffer();
        const bonkBuffer = Buffer.from("bonk");
        const num = new anchor.BN(number);
        const numberBuffer = num.toArrayLike(Buffer, 'le', 4);
        const [bonk] = PublicKey.findProgramAddressSync(
            [
                bonkBuffer,
                bonkingBuffer,
                numberBuffer,
            ],
            ProgramService.getId()
        );
        return bonk
    }

    static async bonk({ connection, wallet, bonkingAddress }: BonkArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonkingObj = await program.account.bonking.fetch(bonkingAddress);
        const bonk = BonkService.bonkPDA(bonkingAddress, bonkingObj.count);
        await program.methods.bonk()
            .accounts({
                bonking: bonkingAddress,
                bonk
            }).rpc()
    }

    static async payToBonk({ connection, wallet, bonkingAddress }: BonkArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonkingObj = await program.account.bonking.fetch(bonkingAddress);
        const toAccount = await getOrCreateAssociatedTokenAccount(connection, wallet, bonkingObj.mint, bonkingObj.owner);
        const bonk = BonkService.bonkPDA(bonkingAddress, bonkingObj.count);
        const fromAccount = await TokenAccountService.findTokenAccountAddress(connection, wallet.publicKey, bonkingObj.mint);
        await program.methods.payedBonk()
            .accounts({
                bonking: bonkingAddress,
                bonk,
                fromAccount: fromAccount,
                toAccount: toAccount.address,
            })
            .rpc()
    }
}