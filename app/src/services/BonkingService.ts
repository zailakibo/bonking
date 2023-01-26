import { PublicKey } from '@solana/web3.js'
import { keccak_256 } from "@noble/hashes/sha3";
import { ProgramService } from './ProgramService';
import * as anchor from "@project-serum/anchor";
import { BonkingModel } from '../models/BonkingModel';
import { Program } from "@project-serum/anchor";
import idl from '../anchor/idl/bonking.json'
import { Bonking as BonkingProg } from "../anchor/types/bonking";

const BONKING = Buffer.from(keccak_256("bonking"));

type InitializeArgs = {
    connection: anchor.web3.Connection
    wallet: any
    bonking: BonkingModel
}

export class BonkingService {
    static findBonkingAddress(slug: string) {
        const [bonkingAddress] = PublicKey.findProgramAddressSync(
            [
                BONKING,
                Buffer.from(keccak_256(slug)),
            ],
            ProgramService.getId()
        );
        return bonkingAddress
    }
    static findEscrowAddress(bonkingAddress: PublicKey) {
        const [escrowWallet] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                bonkingAddress.toBuffer(),
            ],
            ProgramService.getId()
        );
        return escrowWallet
    }
    static findEscrowAddressBySlug(slug: string) {
        const bonkingAddress = BonkingService.findBonkingAddress(slug);
        const escrowWallet = BonkingService.findEscrowAddress(bonkingAddress);
        return escrowWallet
    }
    static async initialize({ connection, wallet, bonking }: InitializeArgs) {
        const hash1 = keccak_256(bonking.hashSource);
        const provider = new anchor.AnchorProvider(connection, wallet as any, {})
        const programId = new PublicKey(idl.metadata.address)
        const program = new Program<BonkingProg>(idl as any, programId, provider)
        const timeout = new anchor.BN(bonking.timeout)
        const amount = new anchor.BN(bonking.amount)

        const bonkingAddress = BonkingService.findBonkingAddress(bonking.slug);
        const escrowWallet = BonkingService.findEscrowAddress(bonkingAddress);
        await program.methods.initialize(hash1 as any, timeout, bonking.slug, amount, bonking.mint)
            .accounts({
                bonking: bonkingAddress,
                escrowWallet,
                mint: bonking.mint,
                prizeMint: bonking.prizeMint,
            })
            .rpc()
    }
}
