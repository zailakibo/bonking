import { createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey, Connection, Transaction } from '@solana/web3.js'

export class TokenAccountService {
    static async findTokenAccountAddress(connection: Connection, owner: PublicKey, mint: PublicKey) {
        const pda = getAssociatedTokenAddressSync(mint, owner);
        try {
            await getAccount(connection, pda)
            return pda
        } catch (e) {
            const tokenAccounts = await connection.getTokenAccountsByOwner(owner, {
                mint: mint
            })
            if (tokenAccounts.value.length > 0) {
                return tokenAccounts.value[0].pubkey
            }
        }
    }

    static async createATA(connection: Connection, wallet: any, mint: PublicKey, owner: PublicKey) {
        const ata = getAssociatedTokenAddressSync(mint, owner);
            const instruction = createAssociatedTokenAccountInstruction(wallet.publicKey, ata, owner, mint);
            const transaction = new Transaction()
            transaction.add(instruction)
            const blockHash = await connection.getLatestBlockhash()
            transaction.feePayer = wallet.publicKey
            transaction.recentBlockhash = blockHash.blockhash
            const signed = await wallet.signTransaction(transaction)
            await connection.sendRawTransaction(signed.serialize())
    }
}