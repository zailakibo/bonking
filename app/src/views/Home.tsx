import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { BonkingService } from "../services/BonkingService";
import { BonkService } from "../services/BonkService";

export function Home() {
    const wallet = useWallet()
    const connection = useConnection()
    const [bonkings, setBonkings] = useState<any[]>([])
    const [bonks, setBonks] = useState<any[]>([])

    const loadBonkings = useCallback(async () => {
        const bonkings = await BonkingService.listAllBonking({
            wallet, connection: connection.connection
        })
        setBonkings(bonkings)
    }, [wallet, connection])

    const loadBonks = useCallback(async () => {
        const bonks = await BonkService.findAllBonksByOwner({
            wallet, connection: connection.connection
        })
        setBonks(bonks.filter(bonk => {
            return bonk.account.owner.toBase58() === wallet.publicKey?.toBase58()
        }))
    }, [wallet, connection])

    useEffect(() => {
        loadBonkings()
        loadBonks()
    }, [connection, loadBonkings, loadBonks])

    async function closeBonk(bonkAddress: PublicKey) {
        await BonkService.closeBonk({
            connection: connection.connection,
            wallet,
            bonkAddress,
        })
        alert('Ok')
    }

    return (
        <div>
            <h1>Bonking Machine!</h1>
            <Link to="/create">Create a new Bonking Machine!!!</Link>
            {bonkings.map(bonking => {
                return <div key={bonking.publicKey.toBase58()}>
                    <Link to={`/bonking/${bonking.publicKey.toBase58()}`}>Bonk me!</Link>
                    <div>
                        Status: {bonking.account.status}
                    </div>
                </div>
            })}
            {bonks.map(bonk => {
                return <div key={bonk.publicKey.toBase58()}>
                    Bonk!
                    {bonk.account.owner.toBase58()}
                    <Button
                        onClick={async () => {
                            await closeBonk(bonk.publicKey)
                        }}
                    >
                        Close!
                    </Button>
                </div>
            })}
        </div>
    )
}