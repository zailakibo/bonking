import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey, Connection } from '@solana/web3.js'

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
}