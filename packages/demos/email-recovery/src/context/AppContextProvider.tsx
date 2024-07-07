import { ReactNode, useMemo, useState } from "react";
import { appContext } from "./AppContext";

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
    const [accountCode, setAccountCode] = useState('');
    const [guardianEmail, setGuardianEmail] = useState('');

    // added
    const [guardianMessage, setGuardianMessage] = useState('');

    const ctxVal = useMemo(() => ({
        accountCode,
        setAccountCode,
        guardianEmail,
        setGuardianEmail,

        //added
        guardianMessage,
        setGuardianMessage,
    }), [
        accountCode,
        guardianEmail,
        
        //added
        guardianMessage
    ]);

    return (
        <appContext.Provider value={ctxVal}>
            {children}
        </appContext.Provider>
    );
}
