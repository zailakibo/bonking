import { BonkingForm } from "../components/BonkingForm";
import { BonkingModel } from "../models/BonkingModel";
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import idl from '../anchor/idl/bonking.json'
import { Bonking as BonkingProg } from "../anchor/types/bonking";
import { keccak_256 } from "@noble/hashes/sha3";
import { Buffer } from 'buffer';

window.Buffer = Buffer;

export function Bonking() {
    const wallet = useWallet()
    const connection = useConnection()

    let bonking: BonkingModel = {
        timeout: Math.floor(Date.now()/1000) + 15 * 60,
        amount: 0,
        mint: new PublicKey('So11111111111111111111111111111111111111112'),
        prizeMint: PublicKey.default,
    }

    async function send(bonking: BonkingModel) {
        if (wallet?.publicKey) {
            const hashSource = "hash source x";
            const hash1 = keccak_256(hashSource);
            const provider = new anchor.AnchorProvider(connection.connection, wallet as any, {})
            const programId = new PublicKey(idl.metadata.address)
            const program = new Program<BonkingProg>(idl as any, programId, provider)
            const timeout = new anchor.BN(bonking.timeout)
            const amount = new anchor.BN(bonking.amount)

            const [bonkingAddress] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("bonking"),
                    wallet.publicKey.toBuffer(),
                    Buffer.from(keccak_256("name2")),
                ],
                program.programId
            );
            const [escrowWallet] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from(anchor.utils.bytes.utf8.encode("wallet")),
                    bonkingAddress.toBuffer(),
                ],
                program.programId
            );
            await program.methods.initialize(hash1 as any, timeout, "name2", amount, bonking.mint)
                .accounts({
                    bonking: bonkingAddress,
                    escrowWallet,
                    mint: bonking.mint,
                    prizeMint: bonking.prizeMint,
                })
                .rpc()
            // console.log({ bonking })
        }
    }

    return (
        <BonkingForm bonking={bonking} send={send}></BonkingForm>
    )
}
