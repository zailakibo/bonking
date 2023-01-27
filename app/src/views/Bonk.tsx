import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { BonkingService } from "../services/BonkingService"
import { BonkService } from "../services/BonkService"

export function Bonk() {
    const [bonking, setBonking] = useState<any>()
    const [showFinalizeByTimeout, setShowFinalizeByTimeout] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [winnerAddress, setWinnerAddress] = useState('')

    const { slug } = useParams()
    const wallet = useWallet()
    const connection = useConnection()

    useEffect(() => {
        loadBonking()
    }, [slug])

    async function loadBonking() {
        if (!slug) return;
        const bonking = await BonkingService.findBonkingBySlug({
            wallet,
            connection: connection.connection,
            slug
        })
        setShowFinalizeByTimeout(bonking.timeout.toNumber() < (Date.now() / 1000));
        if (bonking.status === 2) {
            let winnerBonk = await BonkService.findBonkByBonkingAddressAndNumber({
                wallet,
                connection: connection.connection,
                bonkingAddress: bonking.key,
                number: bonking.winner,
            })
            setWinnerAddress(winnerBonk.owner.toBase58())
            if (winnerBonk.owner.toBase58() === wallet.publicKey?.toBase58()) {
                setShowWithdraw(true)
            }
        }
        setBonking(bonking)
    }

    async function doBonk() {
        if (bonking.amount.toNumber() > 0) {
            await BonkService.payToBonk({
                connection: connection.connection,
                wallet,
                bonkingAddress: bonking.key
            })
        } else {
            await BonkService.bonk({
                connection: connection.connection,
                wallet,
                bonkingAddress: bonking.key
            })
        }
        loadBonking()
        alert("Ok")
    }

    async function finalizeByTimeout() {
        if (!slug) return;
        await BonkingService.finalizeByTimeout({
            wallet,
            connection: connection.connection,
            slug
        })
        loadBonking()
        alert('Ok')
    }

    async function withdraw() {
        if (!slug) return;
        let winnerBonk = BonkService.bonkPDA(bonking.key, bonking.winner)
        await BonkingService.withdraw({
            wallet,
            connection: connection.connection,
            slug,
            winnerBonk,
        })
        loadBonking()
        alert('Ok')
    }

    if (!slug) return (
        <div>Oopsss!!! Something wrong is not right!</div>
    );

    if (!bonking) return (
        <div>Loading...</div>
    );

    return (
        <div>
            Let's Bonk!
            <div>
                Bonk price: {bonking.amount.toNumber()} {bonking.mint.toBase58()}
            </div>
            <div>
                Timeout: {new Date(bonking.timeout.toNumber() * 1000).toString()}
            </div>
            <div>
                Bonks {bonking.count}
            </div>
            {bonking.status === 2 && (
                <div>
                    Winner
                    <div>
                        Number: {bonking.winner}
                    </div>
                    <div>
                        Address: {winnerAddress}
                    </div>
                    {showWithdraw && (
                        <button onClick={withdraw}>Withdraw</button>
                    )}
                </div>
            )}
            {bonking.status === 1 && (
                <>
                    <button onClick={doBonk}>Bonk</button>
                    {showFinalizeByTimeout ? (
                        <button onClick={finalizeByTimeout}>Finalize by timeout</button>
                    ) : (
                        <div>...</div>
                    )}
                </>
            )}
            {bonking.status === 3 && (
                <div>The End</div>
            )}
        </div>
    )
}