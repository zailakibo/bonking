import { PublicKey, Connection } from '@solana/web3.js'
import { keccak_256 } from "@noble/hashes/sha3";
import { ProgramService } from './ProgramService';
import * as anchor from "@project-serum/anchor";
import { BonkingModel } from '../models/BonkingModel';

const BONKING = Buffer.from(keccak_256("bonking"));

type InitializeArgs = {
    connection: Connection
    wallet: any
    bonking: BonkingModel
}

type FindBonkingBySlugArgs = {
    connection: Connection
    wallet: any
    slug: string
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
        const program = ProgramService.getProgram(connection, wallet);

        const hash1 = keccak_256(bonking.hashSource);
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

    static async findBonkingBySlug({ connection, wallet, slug }: FindBonkingBySlugArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonkingAddress = BonkingService.findBonkingAddress(slug);
        const bonking = await program.account.bonking.fetch(bonkingAddress);
        return { ...bonking, key: bonkingAddress };
    }

    static async finalizeByTimeout({ connection, wallet, slug }: FindBonkingBySlugArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonkingAddress = BonkingService.findBonkingAddress(slug);
        await program.methods.finalizeByTimeout()
            .accounts({
                bonking: bonkingAddress
            }).rpc();
    }
}
