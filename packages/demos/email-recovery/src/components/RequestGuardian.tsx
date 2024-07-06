import { useCallback, useContext, useMemo, useState } from "react";
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
import { Box, Grid, Typography, Divider } from '@mui/material';
import InputField from "./InputField";

const RequestGuardian = () => {
  const theme = useTheme();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { guardianEmail, setGuardianEmail, accountCode, setAccountCode } = useAppContext();
  const stepsContext = useContext(StepsContext);

  const [loading, setLoading] = useState(false);
  const [recoveryDelay, setRecoveryDelay] = useState(1);

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

  const configureRecoveryAndRequestGuardian = useCallback(async () => {
    if (!address) {
      throw new Error("unable to get account address");
    }

    if (!guardianEmail) {
      throw new Error("guardian email not set");
    }

    if (!firstSafeOwner) {
      throw new Error("safe owner not found");
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
    <Box sx={{marginX: 'auto'}}>
    <Typography variant='h2' sx={{paddingBottom:'80px', fontWeight:'bold', color: '#333741'}}>Set Up Guardian Details </Typography>
    <Grid container spacing={3} sx={{ maxWidth: isMobile ? "100%" : "50%", width: "100%", marginX: 'auto' }}>

      <Grid item xs={6} sx={{borderRight:'2px solid #EBEBEB', paddingRight: '30px'}}>
        <Box display="flex" flexDirection="column" gap="1rem">
          <Box display="flex" alignItems="center">
            <Typography variant="body1">Recovery Delay (seconds)</Typography>
            <input
              style={{ width: "3rem", marginLeft: "1rem" }}
              type="number"
              min={1}
              value={recoveryDelay}
              onChange={(e) => setRecoveryDelay(Number(e.target.value))}
            />
          </Box>
          <Box display="flex" flexDirection="column" gap="1rem" sx={{textAlign:'left'}}>
            <Typography variant="body1">Connected wallet:</Typography>
            <ConnectKitButton />
          </Box>
          <InputField
            type="text"
            value={guardianEmail}
            onChange={(e) => setGuardianEmail(e.target.value)}
            label="Add a Guardian Message"
          />
        </Box>
      </Grid>

      <Grid item xs={6} sx={{textAlign:'left'}}>
        <Typography variant="h5" sx={{paddingBottom:'20px'}}>Guardian Details:</Typography>
        <Box display="flex" flexDirection="column" gap="1rem">
          {[1, 2, 3].map((index) => (
            <InputField
              key={index}
              type="email"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              label={`Guardian's Email`}
            />
          ))}
        </Box>
      </Grid>
      
      <Grid item xs={12} display="flex" justifyContent="center">
        <Button loading={loading} onClick={configureRecoveryAndRequestGuardian}>
          Configure Recovery and Request Guardian
        </Button>
      </Grid>
    </Grid>
    </Box>
  );
};

export default RequestGuardian;
