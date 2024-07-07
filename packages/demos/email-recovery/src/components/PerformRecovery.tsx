import { useState, useCallback } from 'react'
import { Button } from './Button'
import { relayer } from '../services/relayer'
import { abi as recoveryPluginAbi } from '../abi/SafeZkEmailRecoveryPlugin.json'
import { useReadContract, useAccount } from 'wagmi'
import {
    getRequestsRecoverySubject,
    templateIdx
} from '../utils/email'
import { safeZkSafeZkEmailRecoveryPlugin } from '../../contracts.base-sepolia.json'
import { useAppContext } from '../context/AppContextHook'
import InputField from './InputField'

export function PerformRecovery() {
    const { address } = useAccount()
    const { guardianEmail } = useAppContext()
    const [newOwner, setNewOwner] = useState<string>('')

    const { data: recoveryRouterAddr } = useReadContract({
        abi: recoveryPluginAbi,
        address: safeZkSafeZkEmailRecoveryPlugin as `0x${string}`,
        functionName: 'getRouterForSafe',
        args: [address]
    });

    const requestRecovery = useCallback(async () => {
        if (!address) {
            throw new Error('unable to get account address');
        }

        if (!guardianEmail) {
            throw new Error('guardian email not set')
        }

        if (!newOwner) {
            throw new Error('new owner not set')
        }

        if (!recoveryRouterAddr) {
            throw new Error('could not find recovery router for safe')
        }

        const subject = getRequestsRecoverySubject(address, newOwner)

        const { requestId } = await relayer.recoveryRequest(
            recoveryRouterAddr as string,
            guardianEmail,
            templateIdx,
            subject,
        )
        console.debug('recovery request id', requestId)

    }, [recoveryRouterAddr, address, guardianEmail, newOwner])

    const completeRecovery = useCallback(async () => {
        if (!recoveryRouterAddr) {
            throw new Error('could not find recovery router for safe')
        }

        console.debug('recovery router addr', recoveryRouterAddr);
        const res = relayer.completeRecovery(
            recoveryRouterAddr as string
        );

        console.debug('complete recovery res', res)
    }, [recoveryRouterAddr]);

    return (
        <>
            <InputField
                label='New Owner (address)'
                type='text'
                value={newOwner}
                onChange={e => setNewOwner(e.target.value)}
            />

            <Button onClick={requestRecovery}>
                3. Request Recovery
            </Button>
            <Button onClick={completeRecovery}>
                TEST Complete Recovery (Switch to polling)
            </Button>
        </>
    );
}
