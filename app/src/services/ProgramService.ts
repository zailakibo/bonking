import { PublicKey, Connection } from '@solana/web3.js'
import idl from '../anchor/idl/bonking.json'
import * as anchor from "@project-serum/anchor";
import { Program } from '@project-serum/anchor';
import { Bonking as BonkingProg } from "../anchor/types/bonking";

export class ProgramService {

    private static programId?: PublicKey

    static getId(): PublicKey {
        if (!ProgramService.programId) {
            ProgramService.programId = new PublicKey(idl.metadata.address)
        }
        return ProgramService.programId
    }

    static getProgram(connection: Connection, wallet: any): Program<BonkingProg> {
        const provider = new anchor.AnchorProvider(connection, wallet, {})
        const programId = new PublicKey(idl.metadata.address)
        const program = new Program<BonkingProg>(idl as any, programId, provider)
        return program
    }
}

