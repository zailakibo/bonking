import { PublicKey } from '@solana/web3.js'

export interface BonkingModel {
    timeout: number,
    amount: number,
    mint: PublicKey,
    prizeMint: PublicKey,
    slug: string,
    hashSource: string,
}
