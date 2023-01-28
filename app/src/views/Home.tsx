import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BonkingService } from "../services/BonkingService";

export function Home() {
    const wallet = useWallet()
    const connection = useConnection()
    const [bonkings, setBonkings] = useState<any[]>([])

    useEffect(() => {
        loadBonkings()
    }, [connection])

    async function loadBonkings() {
        const bonkings = await BonkingService.listAllBonking({
            wallet, connection: connection.connection
        })
        setBonkings(bonkings)
    }

    return (
        <div>
            Bonking!
            <Link to="/create">Create a new Bonking Machine!!!</Link>
            {bonkings.map(bonking => {
                return <div key={bonking.publicKey.toBase58()}>
                    <Link to={`/bonking/${bonking.publicKey.toBase58()}`}>Bonk me!</Link>
                    <div>
                        Status: {bonking.account.status}
                    </div>
                </div>
            })}
        </div>
    )
}