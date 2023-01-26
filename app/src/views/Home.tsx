import { Link } from "react-router-dom";

export function Home() {
    return (
        <div>
            Bonking!
            <Link to="/create">Create a new Bonking Machine!!!</Link>
        </div>
    )
}