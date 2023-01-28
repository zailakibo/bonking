import { BonkingForm } from "../components/BonkingForm";
import { BonkingModel } from "../models/BonkingModel";
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Buffer } from 'buffer';
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';
import { useState } from "react";
import { BonkingService } from "../services/BonkingService";

window.Buffer = Buffer;

export function Bonking() {
    const [escrowWallet, setEscrowWallet] = useState('')
    const wallet = useWallet()
    const connection = useConnection()

    const customConfig: Config = {
        dictionaries: [adjectives, colors, animals],
        separator: '-',
        length: 3,
    };
    const slug: string = uniqueNamesGenerator(customConfig);

    let bonking: BonkingModel = {
        slug,
        timeout: Math.floor(Date.now() / 1000) + 15 * 60,
        announcementTimeout: Math.floor(Date.now() / 1000) + 15 * 60,
        amount: 0,
        mint: new PublicKey('So11111111111111111111111111111111111111112'),
        prizeMint: new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
        hashSource: `final bonk ${Math.random()}`,
    }

    async function send(bonking: BonkingModel) {
        if (wallet?.publicKey) {
            await BonkingService.initialize({
                connection: connection.connection,
                wallet,
                bonking,
            })
            const escrowWallet = BonkingService.findEscrowAddressBySlug(bonking.slug)
            setEscrowWallet(escrowWallet.toBase58())
            alert("done!");
        }
    }

    return (
        <>
            <BonkingForm bonking={bonking} send={send}></BonkingForm>
            <div>
                Deposit the prize here: {escrowWallet} (Escrow Account)
            </div>
        </>
    )
}
