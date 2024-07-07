import { createContext } from 'react'

type AppContextType = {
    accountCode: string,
    setAccountCode: (ac: string) => void;
    guardianEmail: string;
    setGuardianEmail: (ge: string) => void;

    // added but does not get used in contract
    guardianMessage: string;
    setGuardianMessage: (gm: string) => void;
}

export const appContext = createContext<AppContextType>({
    accountCode: '',
    setAccountCode: () => {},
    guardianEmail: '',
    setGuardianEmail: () => {},

    // added but does not get used in contract
    guardianMessage: '',
    setGuardianMessage: () => {}
});

