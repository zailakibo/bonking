import React, { useState } from 'react';
import { BonkingModel } from '../models/BonkingModel';
import { PublicKey } from '@solana/web3.js'

type BonkingFormProps = {
    bonking: BonkingModel,
    send: (bonking: BonkingModel) => void
}

export function BonkingForm({ bonking, send }: BonkingFormProps) {
    const [innerBonking, setInnerBonking] = useState({ ...bonking })

    return (
        <div>
            Bonking Form
            <div>
                Timeout: <input value={innerBonking.timeout} onChange={(ev) => {
                    setInnerBonking({ ...innerBonking, timeout: +ev.target.value })
                }} />
            </div>
            <div>
                Amount: <input value={innerBonking.amount} onChange={(ev) => {
                    setInnerBonking({ ...innerBonking, amount: +ev.target.value })
                }} />
            </div>
            <div>
                Mint: <input value={innerBonking.mint.toBase58()} onChange={(ev) => {
                    setInnerBonking({ ...innerBonking, mint: new PublicKey(ev.target.value) })
                }} />
            </div>
            <div>
                Prize Mint: <input value={innerBonking.prizeMint.toBase58()} onChange={(ev) => {
                    setInnerBonking({ ...innerBonking, prizeMint: new PublicKey(ev.target.value) })
                }} />
            </div>
            <button onClick={() => {
                send(innerBonking)
            }}>Send</button>
        </div>
    )
}