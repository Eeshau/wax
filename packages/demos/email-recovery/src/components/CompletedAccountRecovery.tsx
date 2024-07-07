import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { Button } from "./Button";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { abi as safeAbi } from "../abi/Safe.json";
import { useAppContext } from "../context/AppContextHook";
import { abi as recoveryPluginAbi } from "../abi/SafeZkEmailRecoveryPlugin.json";
import { safeZkSafeZkEmailRecoveryPlugin } from "../../contracts.base-sepolia.json";
import { genAccountCode, getRequestGuardianSubject, templateIdx } from "../utils/email";
import { readContract } from "wagmi/actions";
import { config } from "../providers/config";
import { pad } from "viem";
import { relayer } from "../services/relayer";
import { StepsContext } from "../App";
import { STEPS } from "../constants";
import { useTheme } from "@emotion/react";
import { Box, Grid, Typography } from '@mui/material';
import InputField from "./InputField";
import InputNumber from "./InputNumber"; // Import the new component
import StatusTag from "./StatusTag"
import MoreInfoDialog from "./MoreInfoDialog";
import CircleIcon from '@mui/icons-material/Circle';
import Timer from './Timer'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const CompletedAccountRecovery= () => {
  const theme = useTheme();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { guardianEmail, setGuardianEmail, accountCode, setAccountCode } = useAppContext();
  const stepsContext = useContext(StepsContext);

  const [loading, setLoading] = useState(false);
  const [recoveryDelay, setRecoveryDelay] = useState(1);
  const [emailError, setEmailError] = useState(false);
  const [numGuardiansAccepted, setNumGuardiansAccepted] = useState(0); // New state variable

  const isMobile = window.innerWidth < 768;

  const { data: safeOwnersData } = useReadContract({
    address,
    abi: safeAbi,
    functionName: "getOwners",
  });

  const firstSafeOwner = useMemo(() => {
    const safeOwners = safeOwnersData as string[];
    if (!safeOwners?.length) {
      return;
    }
    return safeOwners[0];
  }, [safeOwnersData]);

  useEffect(() => {
    if (!guardianEmail) {
      setEmailError(false);
    } else if (!isValidEmail(guardianEmail)) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  }, [guardianEmail]);

  const configureRecoveryAndRequestGuardian = useCallback(async () => {
    if (!address) {
      throw new Error("Unable to get account address");
    }

    if (!guardianEmail || !isValidEmail(guardianEmail)) {
      setEmailError(true);
      return;
    }

    if (!firstSafeOwner) {
      throw new Error("Safe owner not found");
    }

    try {
      setLoading(true);

      const acctCode = await genAccountCode();
      setAccountCode(accountCode);

      const guardianSalt = await relayer.getAccountSalt(acctCode, guardianEmail);
      const guardianAddr = await readContract(config, {
        abi: recoveryPluginAbi,
        address: safeZkSafeZkEmailRecoveryPlugin as `0x${string}`,
        functionName: "computeEmailAuthAddress",
        args: [guardianSalt],
      });
      const previousOwnerInLinkedList = pad("0x1", { size: 20 });

      await writeContractAsync({
        abi: recoveryPluginAbi,
        address: safeZkSafeZkEmailRecoveryPlugin as `0x${string}`,
        functionName: "configureRecovery",
        args: [
          firstSafeOwner,
          guardianAddr,
          recoveryDelay,
          previousOwnerInLinkedList,
        ],
      });

      const recoveryRouterAddr = (await readContract(config, {
        abi: recoveryPluginAbi,
        address: safeZkSafeZkEmailRecoveryPlugin as `0x${string}`,
        functionName: "getRouterForSafe",
        args: [address],
      })) as string;

      const subject = getRequestGuardianSubject(address);
      const { requestId } = await relayer.acceptanceRequest(
        recoveryRouterAddr,
        guardianEmail,
        acctCode,
        templateIdx,
        subject
      );

      stepsContext?.setStep(STEPS.REQUESTED_RECOVERIES);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    address,
    firstSafeOwner,
    guardianEmail,
    recoveryDelay,
    accountCode,
    setAccountCode,
    writeContractAsync,
  ]);

  return (
    <Box sx={{ marginX: 'auto' }}>
      <Typography variant='h2' sx={{ paddingBottom: '20px'}}>Completed Wallet Transfer! </Typography>
      <Typography variant='h6' sx={{paddingBottom: '80px'}}>Great job your old wallet has successfully transferred </Typography>

    <Grid container spacing={2} sx={{ maxWidth: isMobile ? "100%" : "60%", width: "100%", marginX: 'auto', position:'relative'}}>
    <Box borderRadius={3} width="100%" height='190px' alignContent='center'  sx={{ marginX: 'auto', backgroundColor: '#FCFCFC', border: '1px solid #E3E3E3', paddingY: '20px', paddingX: '25px', position: 'relative' }}>
      
      <Box sx={{ position: 'absolute', top: '13px', right: '13px'}}>
        <StatusTag status="Recovered"/>
      </Box>
      
      <Grid container spacing={2}>

        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1">Lost Wallet:</Typography>
          <Box display="flex" flexDirection="row" gap="1rem" sx={{ textAlign: 'left', marginTop:'10px'}}>
            <ConnectKitButton />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1">Requested New Wallet:</Typography>
          <Box display="flex" flexDirection="row" gap="1rem" sx={{ textAlign: 'left', marginTop:'10px' }}>
            <ConnectKitButton />
          </Box>
        </Grid>

      </Grid>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', }}>
        <SwapHorizIcon/>
  </Box>
</Box>






          <Box width='300px' margin='auto' sx={{marginTop: '50px'}}>
            <Button filled={true}>
              Set Up New Guardians
            </Button>
          </Box>




      </Grid>
    </Box>
  );
};

export default CompletedAccountRecovery;
