import { PublicKey, Connection } from '@solana/web3.js'
import { keccak_256 } from "@noble/hashes/sha3";
import { ProgramService } from './ProgramService';
import * as anchor from "@project-serum/anchor";
import { BonkingModel } from '../models/BonkingModel';
import { getAccount, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import { TokenAccountService } from './TokenAccountService';

const BONKING = Buffer.from(keccak_256("bonking"));

type ListAllBonkingsArgs = {
    connection: Connection
    wallet: any
}

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

type FinalizeArgs = {
    connection: Connection
    wallet: any
    bonkingAddress: anchor.Address
}

type WithdrawArgs = {
    connection: Connection
    wallet: any
    bonkingAddress: anchor.Address
    winnerBonk: PublicKey
}

type FechArgs = {
    connection: Connection
    wallet: any
    bonkingAddress: anchor.Address
}

type CloseArgs = {
    connection: Connection
    wallet: any
    bonkingAddress: anchor.Address,
}

export class BonkingService {
    static async close({ connection, wallet, bonkingAddress }: CloseArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const escrowWalletAddress = BonkingService.findEscrowAddress(bonkingAddress);
        const escrowWallet = await getAccount(connection, escrowWalletAddress);
        const bonking = await BonkingService.fetch({ connection, wallet, bonkingAddress });
        const toAccount = await TokenAccountService.findTokenAccountAddress(connection, bonking.owner, escrowWallet.mint);
        if (!toAccount) {
            throw new Error('Account to redeem is not found');
        }
        await program.methods.closeBonking().accounts({
            bonking: bonkingAddress,
            escrowWallet: escrowWalletAddress,
            to: toAccount,
        }).rpc()
    }

    static async listAllBonking({ connection, wallet }: ListAllBonkingsArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        return program.account.bonking.all()
    }

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

    static findEscrowAddress(bonkingAddress: anchor.Address) {
        bonkingAddress = typeof bonkingAddress === 'string' ? new PublicKey(bonkingAddress) : bonkingAddress;
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
        const bonkingAddress = BonkingService.findBonkingAddress(slug);
        return BonkingService.fetch({ connection, wallet, bonkingAddress })
    }

    static async fetch({ connection, wallet, bonkingAddress }: FechArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        const bonking = await program.account.bonking.fetch(bonkingAddress);
        return { ...bonking, key: typeof bonkingAddress === 'string' ? new PublicKey(bonkingAddress) : bonkingAddress };
    }

    static async finalizeByTimeout({ connection, wallet, bonkingAddress }: FinalizeArgs) {
        const program = ProgramService.getProgram(connection, wallet);
        await program.methods.finalizeByTimeout()
            .accounts({
                bonking: new PublicKey(bonkingAddress)
            }).rpc();
    }

    static async withdraw({ connection, wallet, bonkingAddress, winnerBonk }: WithdrawArgs) {
        bonkingAddress = typeof bonkingAddress === 'string' ? new PublicKey(bonkingAddress) : bonkingAddress;
        const program = ProgramService.getProgram(connection, wallet);
        const escrowWallet = BonkingService.findEscrowAddress(bonkingAddress);
        const escrowObj = await getAccount(connection, escrowWallet);
        const ata = await getAssociatedTokenAddress(escrowObj.mint, wallet.publicKey);
        try {
            await getAccount(connection, ata);
            await program.methods.withdraw()
                .accounts({
                    bonking: bonkingAddress, winnerBonk, escrowWallet,
                    mint: escrowObj.mint, to: ata,
                })
                .rpc()
        } catch (e) {
            console.log(e)
            await program.methods.withdrawInitializingTokenAccount()
                .accounts({
                    bonking: bonkingAddress, winnerBonk, escrowWallet,
                    mint: escrowObj.mint, to: ata,
                    payer: wallet.publicKey,
                })
                .rpc()
        }
    }
}
