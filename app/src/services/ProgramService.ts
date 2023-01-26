import { PublicKey } from '@solana/web3.js'
import idl from '../anchor/idl/bonking.json'

export class ProgramService {

    private static programId?: PublicKey

    static getId(): PublicKey {
        if (!ProgramService.programId) {
            ProgramService.programId = new PublicKey(idl.metadata.address)
        }
        return ProgramService.programId
    }
}

