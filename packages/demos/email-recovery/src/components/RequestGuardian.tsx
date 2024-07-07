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

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const RequestGuardian = () => {
  const theme = useTheme();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { guardianEmail, setGuardianEmail, accountCode, setAccountCode } = useAppContext();
  const stepsContext = useContext(StepsContext);

  const [loading, setLoading] = useState(false);
  const [recoveryDelay, setRecoveryDelay] = useState(1);
  const [emailError, setEmailError] = useState(false);

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
      <Typography variant='h2' sx={{ paddingBottom: '80px', fontWeight: 'bold', color: '#333741' }}>Set Up Guardian Details </Typography>
      <Grid container spacing={3} sx={{ maxWidth: isMobile ? "100%" : "60%", width: "100%", marginX: 'auto' }}>

        <Grid item xs={6} sx={{ borderRight: '3px solid #EBEBEB', paddingRight: '30px' }}>
          <Box display="flex" flexDirection="column" gap="1rem" sx={{ paddingRight: '5px' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ marginRight: '25px' }}>Recovery Delay (seconds)</Typography>
                <InputNumber
                  value={recoveryDelay}
                  onChange={(e) => setRecoveryDelay(Number(e.target.value))}
                  min={1}
                />
              </Box>
              <MoreInfoDialog
                title='Recovery Delay'
                message='This is the delay you the actual wallet owner has to cancel recovery after recovery has been initiated, helpful for preventing malicious behavior from guardians.'
              />
            </Box>

            <Box display="flex" flexDirection="column" gap="1rem" sx={{ textAlign: 'left' }}>
              <Typography variant="body1">Connected wallet:</Typography>
              <ConnectKitButton />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ textAlign: 'left' }}>
              <Box flex="1" sx={{ marginRight: '25px' }}>
                <InputField
                  placeholderText='message'
                  type="text"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  label="Add a Guardian Message"
                  locked={false}
                  {...(guardianEmail && {
                    status: emailError ? 'error' : 'okay',
                    statusNote: emailError ? 'Please enter the correct email address' : 'Okay'
                  })}
                />
              </Box>
              <Box>
                <MoreInfoDialog
                  title='Guardian Message'
                  message='This message will get sent along in the email with our default instructions. This can be helpful later for your guardians to find the email that contains your lost wallet without having to remember the lost wallet address.'
                />
              </Box>
            </Box>

          </Box>
        </Grid>

        <Grid item xs={6} sx={{ textAlign: 'left' }}>
          <Box sx={{ paddingLeft: '25px' }}>
            <Typography variant="h5" sx={{ paddingBottom: '20px', fontWeight: 700 }}>Guardian Details:</Typography>
            <Box display="flex" flexDirection="column" gap="1rem">
              {[1, 2, 3].map((index) => (
                <InputField
                  placeholderText='guardian@prove.email'
                  key={index}
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  label={`Guardian's Email`}
                  locked={false}
                  {...(guardianEmail && {
                    status: emailError ? 'error' : 'okay',
                    statusNote: emailError ? 'Please enter the correct email address' : 'Okay'
                  })}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="center">
          <Button loading={loading} onClick={configureRecoveryAndRequestGuardian}>
            Configure Recovery and Request Guardian
          </Button>
        </Grid>
      </Grid>

      <StatusTag status="Guarded" />
      <StatusTag status="Recovered" />

    </Box>
  );
};

export default RequestGuardian;
