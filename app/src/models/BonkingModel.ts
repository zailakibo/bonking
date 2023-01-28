import { PublicKey } from '@solana/web3.js'

export interface BonkingModel {
    timeout: number,
    announcementTimeout: number,
    amount: number,
    mint: PublicKey,
    prizeMint: PublicKey,
    slug: string,
    hashSource: string,
}
