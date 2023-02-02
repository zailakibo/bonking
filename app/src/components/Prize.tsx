import { getAccount } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { BonkingService } from "../services/BonkingService"

type PrizeArgs = {
    bonking: {
        key: any
    },
}

export function Prize({ bonking }: PrizeArgs) {
    const connection = useConnection()

    const [amount, setAmount] = useState('')
    const [mint, setMint] = useState('')

    useEffect(() => {
        async function loadAccount(bonkingAddress: any) {
            const escrowAddress = BonkingService.findEscrowAddress(bonkingAddress)
            const account = await getAccount(connection.connection, escrowAddress)
            setAmount(account.amount.toString());
            setMint(account.mint.toBase58())
        }
        loadAccount(bonking.key)
    }, [bonking, connection])

    return (
        <>
            <div>
                Prize: {amount}
            </div>
            <div>
                Mint: {mint}
            </div>
        </>
    )
}
