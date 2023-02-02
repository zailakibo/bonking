import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Prize } from "../components/Prize"
import { BonkingService } from "../services/BonkingService"
import { BonkService } from "../services/BonkService"
import { TokenAccountService } from "../services/TokenAccountService"

export function Bonk() {
    const [bonking, setBonking] = useState<any>()
    const [showFinalizeByTimeout, setShowFinalizeByTimeout] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [winnerAddress, setWinnerAddress] = useState('')

    const { slug, bonkingAddress } = useParams()
    const wallet = useWallet()
    const connection = useConnection()

    const loadBonking = useCallback(async () => {
        if (slug) {
            const bonking = await BonkingService.findBonkingBySlug({
                wallet,
                connection: connection.connection,
                slug
            })
            return bonking;
        } else if (bonkingAddress) {
            const bonking = await BonkingService.fetch({
                wallet,
                connection: connection.connection,
                bonkingAddress
            })
            return bonking;
        }
    }, [slug, wallet, connection, bonkingAddress])

    const handleStatus = useCallback(async (bonking: any) => {
        if (!bonking.key) throw new Error('Missing bonking.key');
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
    }, [wallet, connection])

    const initialize = useCallback(async () => {
        const bonking = await loadBonking()
        handleStatus(bonking)
        setBonking(bonking)
    }, [handleStatus, setBonking, loadBonking])

    useEffect(() => {
        initialize()
    }, [slug, bonkingAddress, wallet, initialize])

    async function reInitialize() {
        await initialize()
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
        reInitialize()
        alert("Ok")
    }

    function getBonkingAddress() {
        if (slug) {
            return BonkingService.findBonkingAddress(slug)
        } else if (bonkingAddress) {
            return bonkingAddress
        } else {
            throw Error('Unable to define bonking')
        }
    }

    async function finalizeByTimeout() {
        await BonkingService.finalizeByTimeout({
            wallet,
            connection: connection.connection,
            bonkingAddress: getBonkingAddress()
        })
        reInitialize()
        alert('Ok')
    }

    async function withdraw() {
        let winnerBonk = BonkService.bonkPDA(bonking.key, bonking.winner)
        await BonkingService.withdraw({
            wallet,
            connection: connection.connection,
            bonkingAddress: getBonkingAddress(),
            winnerBonk,
        })
        reInitialize()
        alert('Ok')
    }

    async function closeTheBonk() {
        try {
            await BonkingService.close({
                wallet,
                connection: connection.connection,
                bonkingAddress: getBonkingAddress(),
            })
        } catch (e) {
            if (e instanceof Error) {
                if (/token account not found/i.test(e.message) && window.confirm('Create TokenAccount?')) {
                    const escrowAccount = await BonkingService.findEscrowAccount({
                        connection: connection.connection,
                        bonkingAddress: getBonkingAddress(),
                    })
                    await TokenAccountService.createATA(connection.connection, wallet, escrowAccount.mint, bonking.owner)
                }
            }
        }
        alert('Ok')
    }

    if (!slug && !bonkingAddress) return (
        <div>Oopsss!!! Something wrong is not right!</div>
    );

    if (!bonking) return (
        <div>Loading...</div>
    );

    return (
        <div>
            Let's Bonk!
            <div>
                {bonking.amount.toNumber() === 0 ? (
                    <div>It's almost free to bonk!!!</div>
                ) : (
                    <div>
                        Bonk price: {bonking.amount.toNumber()} {bonking.mint.toBase58()}
                    </div>
                )}
            </div>
            <div>
                Bonking party ends at {new Date(bonking.timeout.toNumber() * 1000).toString()}
            </div>
            <div>
                It was bonked {bonking.count} times!
            </div>
            <Prize bonking={bonking} />
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
                <>
                    <div>The End</div>
                    <button onClick={closeTheBonk}>Close the bonk!</button>
                </>
            )}
            <div>
                Promoter: {bonking.owner.toBase58()}
            </div>
        </div>
    )
}