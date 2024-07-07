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


const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const WalletGuarded = () => {
  const theme = useTheme();

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { guardianEmail, setGuardianEmail, accountCode, setAccountCode, guardianMessage, setGuardianMessage } = useAppContext();
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
      <Typography variant='h2' sx={{ paddingBottom: '20px'}}>Congrats Your Wallet <br></br> is Guarded!</Typography>
      <Typography variant='h6' sx={{paddingBottom: '80px'}}></Typography>

      <Grid container spacing={3} sx={{ maxWidth: isMobile ? "100%" : "60%", width: "100%", marginX: 'auto' }}>

        <Grid item xs={6} sx={{ borderRight: '1px solid #EBEBEB', paddingRight: '30px' }}>
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
              {/* <MoreInfoDialog
                title='Recovery Delay'
                message='This is the delay you the actual wallet owner has to cancel recovery after recovery has been initiated, helpful for preventing malicious behavior from guardians.'
              /> */}
            </Box>

            <Box display="flex" flexDirection="column" gap="1rem" sx={{ textAlign: 'left' }}>
              {/* <Typography variant="body1">Connected wallet:</Typography>
              <Box display="flex" flexDirection="row" gap="1rem" sx={{ textAlign: 'left' }}>
                <ConnectKitButton />
                <StatusTag status="Guarded" />
              </Box> */}

              <Box borderRadius={3} width='100%' sx={{  marginX: 'auto', backgroundColor: '#FCFCFC', border: '1px solid #E3E3E3', paddingY:'20px', paddingX:'25px' }}>
                <Box display="flex" flexDirection="column" gap="1rem" sx={{ textAlign: 'left' }}>
                  <Box display="flex" flexDirection="row" gap="1rem" sx={{ textAlign: 'left' }}>
                    <CircleIcon sx={{padding:'5px', color: '#6DD88B', marginRight:'-10px'}}/>
                    <Typography variant="body1">Connected wallet:</Typography>
                    <StatusTag status="Guarded" />
                  </Box>
                  <Box display="flex" flexDirection="row" gap="1rem" sx={{ textAlign: 'left' }}>
                    <ConnectKitButton />
                  </Box>
                </Box>
              </Box>


            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ textAlign: 'left' }}>
              <Box flex="1" sx={{ marginRight: '25px' }}>
                <InputField
                    placeholderText={guardianMessage}
                    type="text"
                    value={guardianMessage}
                    onChange={(e) => setGuardianMessage(e.target.value)}
                    label="Add a Guardian Message"
                    locked={true}
                  />
              </Box>
              {/* <Box>
                <MoreInfoDialog
                  title='Guardian Message'
                  message='This message will get sent along in the email with our default instructions. This can be helpful later for your guardians to find the email that contains your lost wallet without having to remember the lost wallet address.'
                />
              </Box> */}
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
                  locked={true}
                  status='okay'        //change to 'okay' when guardian accepts
                  statusNote= 'All Guardians have accepted the request!'  //change to 'A Guardian has accepted the request!' when guardian accepts
                />
              ))}
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{marginTop:'30px'}}>
          <Box  sx={{width:'330px', marginX: 'auto'}}>
          <Button href="/">
              Return Home
          </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WalletGuarded;
