import * as anchor from "@project-serum/anchor";
import { PublicKey, Connection } from '@solana/web3.js'
import { ProgramService } from "./ProgramService";
import { Buffer } from 'buffer';

type BonkArgs = {
    connection: Connection,
    wallet: any,
    bonkingAddress: PublicKey,
}

export class BonkService {
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
}