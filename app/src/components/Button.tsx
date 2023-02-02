import { useState } from "react"

type ButtonArgs = {
    children: any,
    onClick: () => Promise<void>,
}

export function Button({ children, onClick }: ButtonArgs) {
    const [loading, setLoading] = useState(false)

    async function clickHandler() {
        setLoading(true)
        try {
            await onClick()
        } catch (e) {
            console.error(e)
            if (e instanceof Error) {
                alert(`Ops!!! ${e.message}`)
            } else {
                alert('Error with error!')
            }
        }
        setLoading(false)
    }

    return (
        <button
            disabled={loading}
            onClick={clickHandler}
        >{children}</button>
    )
}
