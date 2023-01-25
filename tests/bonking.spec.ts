import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Bonking } from "../target/types/bonking";
import { keccak_256 } from "@noble/hashes/sha3";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { createAssociatedTokenAccount, createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

describe("bonking", () => {
    // Configure the client to use the local cluster.
    anchor.setProvider(anchor.AnchorProvider.env());

    const program = anchor.workspace.Bonking as Program<Bonking>;
    const connection = program.provider.connection;

    it("is a success!", async () => {
        const hashSource = "hash source x";
        const hash1 = keccak_256(hashSource);
        const [bonking] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("bonking"),
                program.provider.publicKey?.toBuffer(),
                Buffer.from(keccak_256("name2")),
            ],
            program.programId
        );
        const provider = program.provider as anchor.AnchorProvider;
        const wallet = provider.wallet as NodeWallet;
        const mint = await createMint(connection, wallet.payer, provider.publicKey, provider.publicKey, 9);

        const [escrowWallet] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                bonking.toBuffer(),
            ],
            program.programId
        );

        const bonkTimeout = new anchor.BN(Math.floor(Date.now() / 1000));
        const tx = await program.methods.initialize(hash1 as any, bonkTimeout, "name2", new anchor.BN(0), PublicKey.default)
            .accounts({
                bonking, escrowWallet, mint, prizeMint: mint,
            }).rpc();
        console.log("Your transaction signature", tx);

        // transfer the ownership of the escrow
        const escrowWalletTokenAccount = await getAccount(connection, escrowWallet);
        expect(escrowWalletTokenAccount.owner).not.to.eql(provider.publicKey);
        expect(escrowWalletTokenAccount.owner).to.eql(escrowWallet);

        // put the value on escrow
        await mintTo(connection, wallet.payer, mint, escrowWallet, wallet.payer, 5_000_000_000);

        const bonkingObj = await program.account.bonking.fetch(bonking);
        expect(bonkingObj.hash1).to.be.eql(Array.from(hash1));

        await bonk(program, bonking);
        await bonk(program, bonking);
        await bonk(program, bonking);

        const bonkingObj2 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj2.count).to.be.eq(3);

        // finalize the operation
        await program.methods.finalize(hashSource)
            .accounts({
                bonking
            }).rpc();

        const bonkingObj3 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj3.winner).to.be.within(0, 2);

        const notWinnerBonk = bonkPDA(program, bonking, (bonkingObj3.winner + 1) % bonkingObj3.count);
        const error = await program.methods.withdraw().accounts({
            bonking, winnerBonk: notWinnerBonk, escrowWallet, mint,
        }).rpc().catch(e => e)
        expect(error).to.be.instanceOf(Error)

        const toAccount = await createAssociatedTokenAccount(connection, wallet.payer, mint, wallet.publicKey)

        const winnerBonk = bonkPDA(program, bonking, bonkingObj3.winner);
        await program.methods.withdraw().accounts({
            bonking, winnerBonk, escrowWallet, mint, to: toAccount
        }).rpc()

        await program.methods.closeBonking().accounts({
            bonking,
            escrowWallet,
        }).rpc()

        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 0, wallet.payer);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 1, wallet.payer);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 2, wallet.payer);
    });

    it("is a success! Timeout", async () => {
        const hashSource = "hash source x";
        const hash1 = keccak_256(hashSource);
        const [bonking] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("bonking"),
                program.provider.publicKey?.toBuffer(),
                Buffer.from(keccak_256("name")),
            ],
            program.programId
        );
        const provider = program.provider as anchor.AnchorProvider;
        const wallet = provider.wallet as NodeWallet;
        const mint = await createMint(connection, wallet.payer, provider.publicKey, provider.publicKey, 9);

        const [escrowWallet] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                bonking.toBuffer(),
            ],
            program.programId
        );

        const bonkTimeout = new anchor.BN(Math.floor(Date.now() / 1000) - (14 * 60 * 60));
        const tx = await program.methods.initialize(hash1 as any, bonkTimeout, "name", new anchor.BN(0), PublicKey.default)
            .accounts({
                bonking, escrowWallet, mint, prizeMint: mint,
            }).rpc();
        console.log("Your transaction signature", tx);

        // transfer the ownership of the escrow
        const escrowWalletTokenAccount = await getAccount(connection, escrowWallet);
        expect(escrowWalletTokenAccount.owner).not.to.eql(provider.publicKey);
        expect(escrowWalletTokenAccount.owner).to.eql(escrowWallet);

        // put the value on escrow
        await mintTo(connection, wallet.payer, mint, escrowWallet, wallet.payer, 5_000_000_000);

        const bonkingObj = await program.account.bonking.fetch(bonking);
        expect(bonkingObj.hash1).to.be.eql(Array.from(hash1));

        console.log('bonking...');
        await bonk(program, bonking);
        await bonk(program, bonking);
        await bonk(program, bonking);

        const bonkingObj2 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj2.count).to.be.eq(3);

        // finalize the operation
        await program.methods.finalizeByTimeout()
            .accounts({
                bonking
            }).rpc();

        const bonkingObj3 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj3.winner).to.be.within(0, 2);

        const notWinnerBonk = bonkPDA(program, bonking, (bonkingObj3.winner + 1) % bonkingObj3.count);
        const error = await program.methods.withdraw().accounts({
            bonking, winnerBonk: notWinnerBonk, escrowWallet, mint,
        }).rpc().catch(e => e)
        expect(error).to.be.instanceOf(Error)

        const toAccount = await createAssociatedTokenAccount(connection, wallet.payer, mint, wallet.publicKey)

        const winnerBonk = bonkPDA(program, bonking, bonkingObj3.winner);
        await program.methods.withdraw().accounts({
            bonking, winnerBonk, escrowWallet, mint, to: toAccount
        }).rpc()

        await program.methods.closeBonking().accounts({
            bonking,
            escrowWallet,
        }).rpc()

        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 0, wallet.payer);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 1, wallet.payer);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 2, wallet.payer);
    });

    it("is a success! Payed", async () => {
        const hashSource = "hash source x";
        const hash1 = keccak_256(hashSource);
        const [bonking] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("bonking"),
                program.provider.publicKey?.toBuffer(),
                Buffer.from(keccak_256("name")),
            ],
            program.programId
        );
        const provider = program.provider as anchor.AnchorProvider;
        const wallet = provider.wallet as NodeWallet;
        const mint = await createMint(connection, wallet.payer, provider.publicKey, provider.publicKey, 9);

        const payWithMint = await createMint(connection, wallet.payer, provider.publicKey, provider.publicKey, 9);

        const [escrowWallet] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                bonking.toBuffer(),
            ],
            program.programId
        );

        const bonkTimeout = new anchor.BN(Math.floor(Date.now() / 1000) - (14 * 60 * 60));
        const tx = await program.methods.initialize(hash1 as any, bonkTimeout, "name", new anchor.BN(10), payWithMint)
            .accounts({
                bonking, escrowWallet, mint, prizeMint: mint,
            }).rpc();
        console.log("Your transaction signature", tx);

        // transfer the ownership of the escrow
        const escrowWalletTokenAccount = await getAccount(connection, escrowWallet);
        expect(escrowWalletTokenAccount.owner).not.to.eql(provider.publicKey);
        expect(escrowWalletTokenAccount.owner).to.eql(escrowWallet);

        // put the value on escrow
        await mintTo(connection, wallet.payer, mint, escrowWallet, wallet.payer, 5_000_000_000);

        const endUserWallet = anchor.web3.Keypair.generate()
        await connection.requestAirdrop(
            endUserWallet.publicKey,
            anchor.web3.LAMPORTS_PER_SOL * 1
        );

        // some value to pay the bonk
        console.log('create end user account')
        const endUserAccount = await getOrCreateAssociatedTokenAccount(
            program.provider.connection,
            wallet.payer, payWithMint, endUserWallet.publicKey)
        console.log('mint...')
        await mintTo(connection, wallet.payer, payWithMint, endUserAccount.address, wallet.payer, 30);

        const bonkingObj = await program.account.bonking.fetch(bonking);
        expect(bonkingObj.hash1).to.be.eql(Array.from(hash1));

        console.log('bonking...');
        await payedBonk(program, bonking, payWithMint, endUserAccount.address, endUserWallet);
        await payedBonk(program, bonking, payWithMint, endUserAccount.address, endUserWallet);
        await payedBonk(program, bonking, payWithMint, endUserAccount.address, endUserWallet);

        const bonkingObj2 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj2.count).to.be.eq(3);

        // finalize the operation
        console.log('finalizing...')
        await program.methods.finalizeByTimeout()
            .accounts({
                bonking
            }).rpc();

        const bonkingObj3 = await program.account.bonking.fetch(bonking);
        expect(bonkingObj3.winner).to.be.within(0, 2);

        const notWinnerBonk = bonkPDA(program, bonking, (bonkingObj3.winner + 1) % bonkingObj3.count);

        console.log('withdraw error...')
        const error = await program.methods.withdraw().accounts({
            bonking, winnerBonk: notWinnerBonk, escrowWallet, mint,
        }).rpc().catch(e => e)
        expect(error).to.be.instanceOf(Error)

        const toAccount = await createAssociatedTokenAccount(connection, wallet.payer, mint, endUserWallet.publicKey)

        const winnerBonk = bonkPDA(program, bonking, bonkingObj3.winner);
        console.log('withdraw success...')
        await program.methods.withdraw().accounts({
            bonking, winnerBonk, escrowWallet, mint, to: toAccount,
            payer: endUserWallet.publicKey
        })
            .signers([endUserWallet])
            .rpc()

        console.log('close bonking...')
        await program.methods.closeBonking().accounts({
            bonking,
            escrowWallet,
        }).rpc()

        console.log('close bonks...')
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 0, endUserWallet);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 1, endUserWallet);
        await closeBonkNotWinner(program, bonking, bonkingObj3.winner, 2, endUserWallet);

        const endUserAccountFinal = await getOrCreateAssociatedTokenAccount(program.provider.connection, wallet.payer, mint, endUserWallet.publicKey);
        const expected = 5_000_000_000;
        expect(endUserAccountFinal.amount.toString()).to.eq(expected.toString());
    });
});

async function closeBonkNotWinner(program: Program<Bonking>, bonking: PublicKey, winner: number, number: number, payer: anchor.web3.Keypair) {
    if (winner !== number) {
        console.time(`close bonk ${number}`)
        await closeBonk(program, bonking, number, payer);
        console.timeEnd(`close bonk ${number}`)
    }
}

function bonkPDA(program: Program<Bonking>, bonking: PublicKey, number: number) {
    const [bonk] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("bonk"),
            bonking.toBuffer(),
            new anchor.BN(number).toBuffer('le', 4),
        ],
        program.programId
    );
    return bonk
}

async function bonk(program: Program<Bonking>, bonking: PublicKey) {
    console.time('bonk')
    const bonkingObj = await program.account.bonking.fetch(bonking);
    const bonk = bonkPDA(program, bonking, bonkingObj.count);
    await program.methods.bonk()
        .accounts({
            bonking,
            bonk
        }).rpc()
    console.timeEnd('bonk')
}

async function payedBonk(program: Program<Bonking>, bonking: PublicKey, payWithMint: PublicKey, fromAccount: PublicKey, payer: anchor.web3.Keypair) {
    console.time('bonk')
    const provider = program.provider as anchor.AnchorProvider;
    const wallet = provider.wallet as NodeWallet;
    const toAccount = await getOrCreateAssociatedTokenAccount(
        program.provider.connection,
        wallet.payer, payWithMint, wallet.publicKey)

    const bonkingObj = await program.account.bonking.fetch(bonking);
    const bonk = bonkPDA(program, bonking, bonkingObj.count);
    await program.methods.payedBonk()
        .accounts({
            bonking,
            bonk,
            fromAccount,
            toAccount: toAccount.address,
            payer: payer.publicKey,
        })
        .signers([payer])
        .rpc()
    console.timeEnd('bonk')
}

async function closeBonk(program: Program<Bonking>, bonking: PublicKey, number: number, payer: anchor.web3.Keypair) {
    await program.methods.closeBonk()
        .accounts({
            bonk: bonkPDA(program, bonking, number),
            payer: payer.publicKey
        })
        .signers([payer])
        .rpc();
}