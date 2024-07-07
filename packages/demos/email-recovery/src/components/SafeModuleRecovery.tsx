import { ConnectKitButton } from "connectkit";
import { Button } from "./Button";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { safeZkSafeZkEmailRecoveryPlugin } from "../../contracts.base-sepolia.json";
import { abi as safeAbi } from "../abi/Safe.json";
import { useCallback, useContext, useEffect, useState } from "react";
import { StepsContext } from "../App";
import { STEPS } from "../constants";
import {Box, Typography} from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle';

const SafeModuleRecovery = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const stepsContext = useContext(StepsContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      stepsContext?.setStep(STEPS.CONNECT_WALLETS);
    }
  }, [address, stepsContext]);

  const { data: isModuleEnabled } = useReadContract({
    address,
    abi: safeAbi,
    functionName: "isModuleEnabled",
    args: [safeZkSafeZkEmailRecoveryPlugin],
  });

  console.log(isModuleEnabled);

  if (isModuleEnabled) {
    console.log("Module is enabled");
    setLoading(false);
    stepsContext?.setStep(STEPS.REQUEST_GUARDIAN);
  }

  const enableEmailRecoveryModule = useCallback(async () => {
    setLoading(true);
    if (!address) {
      throw new Error("unable to get account address");
    }

    await writeContractAsync({
      abi: safeAbi,
      address,
      functionName: "enableModule",
      args: [safeZkSafeZkEmailRecoveryPlugin],
    });
  }, [address, writeContractAsync]);

  return (
    <Box sx={{ marginX: 'auto' }}>
    <Typography variant='h2' sx={{ paddingBottom: '10px'}}>Set Up Wallet Recovery</Typography>
    <Typography variant='h6' sx={{paddingBottom: '80px'}}>Connect your wallet now to make your wallet <br></br>recoverable by guardian.</Typography>
    <div style={{ display: "flex", gap: "2rem", flexDirection: "column"}}>


      <Box borderRadius={3} sx={{  marginX: 'auto', backgroundColor: '#FCFCFC', border: '1px solid #E3E3E3', paddingY:'20px', paddingX:'25px' }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <CircleIcon sx={{padding:'5px', color: '#6DD88B', marginRight:'-10px'}}/>
          Connected wallet: <ConnectKitButton />
        </div>
      </Box>

      {!isModuleEnabled ? (
        <Box sx={{marginX: 'auto', width: '310px'}}>
          <Button filled={true} disabled={loading} onClick={enableEmailRecoveryModule}>
            Enable Email Recovery Module
          </Button>
        </Box>

      ) : null}
    </div>
    </Box>
  );
};

export default SafeModuleRecovery;
