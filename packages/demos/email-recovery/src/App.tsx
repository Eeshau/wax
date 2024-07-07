import { createContext, useEffect, useState } from "react";
import "./App.css";
import ConnectWallets from "./components/ConnectWallets";
import ConnectWallet from "./components/ConnectWallet";
import NavBar from "./components/NavBar";
import RequestedRecoveries from "./components/RequestedRecoveries";
import RequestGuardian from "./components/RequestGuardian";
import RequestGuardianStatus from "./components/RequestGuardianStatus";
import WalletGuarded from "./components/WalletGuarded";
import SafeModuleRecovery from "./components/SafeModuleRecovery";
import TriggerAccountRecoveryEmails from "./components/TriggerAccountRecoveryEmails"
import TriggerAccountRecovery from "./components/TriggerAccountRecovery";
import { STEPS } from "./constants";
import { Web3Provider } from "./providers/Web3Provider";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { AppContextProvider } from "./context/AppContextProvider";
import { useTheme, Grid, Typography, Box, TextField, Stack } from '@mui/material';
import './App.css';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import Toggle from './components/Toggle';
import { Button } from "./components/Button";
import { Link } from 'react-router-dom';
import InputField from "./components/InputField";
import { PerformRecovery } from "./components/PerformRecovery";
import SvgWrapper from './components/SvgIconWrapper';
import gnosisSafeLogo from './assets/gnosis-safe-logo.svg';
import MoreInfoDialog from "./components/MoreInfoDialog";

export const StepsContext = createContext(null);

type FlowType = 'setup' | 'recover';

function App() {
  const theme = useTheme();
  const [flow, setFlow] = useState<FlowType>('setup');

  const handleFlowChange = (newFlow: FlowType) => {
    setFlow(newFlow);
    console.log(flow);
  };

  console.log(import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID);

  const [step, setStep] = useState(STEPS.CONNECT_WALLETS);



  const renderBody = () => {
    switch (step) {
      case STEPS.CONNECT_WALLETS:
        return <ConnectWallets />;
      case STEPS.SAFE_MODULE_RECOVERY:
        return <SafeModuleRecovery />;
      case STEPS.REQUEST_GUARDIAN:
        return <RequestGuardian />;
      case STEPS.REQUESTED_RECOVERIES:
        return <RequestedRecoveries />;
      case STEPS.TRIGGER_ACCOUNT_RECOVERY:
        return <TriggerAccountRecovery />;
      default:
        return <ConnectWallets />;
    }
  };

  return (
    <Web3Provider>
      <AppContextProvider>
        <StepsContext.Provider
          value={{
            setStep,
          }}
        >
          <div>
            <NavBar />

            <div className='bg-white'>
              <Grid sx={{color:'10px', paddingTop: '120px'}}>
                <Box display='flex' justifyContent='center' sx={{borderRadius:'25.95px', border:'1px solid #CECFD2', width: '170px', marginX: 'auto', padding:'5px', marginBottom:'20px'}}>
                  <DraftsOutlinedIcon fill='black' sx={{marginX:'5px', padding:'4px'}} />
                    ZK Email Tech
                </Box>
                <Typography variant='h1' sx={{color: theme.palette.primary.main}}>
                  Email Recovery Demo
                </Typography>   
                <Typography sx={{color: theme.palette.secondary.main, paddingTop:'15px', fontWeight:'medium', lineHeight:'140%'}}>
                    3 assigned Guardians must reply back to an email to <br></br>
                    enable wallet recovery to a new address.
                </Typography>
                <Toggle onFlowChange={handleFlowChange} />
              </Grid>

              {flow === 'setup' ? (
                // SETUP FLOW
                <Box sx={{height:'250px', alignContent: 'center', justifyContent: 'center', marginX: 'auto'}}>
                  <Grid container>
                    {/* GNOSIS SAFE */}
                    <Grid item xs={6} padding='20px'>
                      <Box sx={{height:'250px', width:'500px', marginX: 'auto', background:'#FFFFFF', border:'1px solid #DDDDDD', borderRadius:'18px', position:'relative'}}>
                        <Box sx={{ position: 'absolute', top: '10px', right: '12px'}}>
                          <MoreInfoDialog
                            title='Gnosis Safe Wallet Recovery Setup' 
                            message='This message will get sent along in the email with our default instructions. This can be helpful later for your guardians to find the email that contains your lost wallet without having to remember the lost wallet address.'
                          />
                        </Box>
                        <SvgWrapper src={gnosisSafeLogo} sx={{marginTop:'25px', width: '40px', height: '40px'}} />
                        <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'10px', paddingTop:'10px'}}>Gnosis Safe</Typography>
                        <Typography sx={{color:'#848281', fontWeight:'regular', fontSize: '16px', paddingBottom:'10px'}}>Copy the link and import into your Safe wallet</Typography>
                        <ConnectWallet />
                      </Box>
                    </Grid>



                    {/* TEST WALLET */}
                    <Grid item xs={6} padding='20px'>
                      <Box sx={{height:'250px', width:'500px', marginX: 'auto', background:'#FFFFFF', border:'1px solid #DDDDDD', borderRadius:'18px', position:'relative'}}>
                        <Box sx={{ position: 'absolute', top: '10px', right: '12px'}}>
                          <MoreInfoDialog
                            title='Test Wallet Recovery Setup' 
                            message='Test out our setup and recovery flow with a test wallet.'
                          />
                        </Box>
                        <AccountBalanceWalletOutlinedIcon fill='black' sx={{marginTop:'25px', width: '35px', height: '35px'}} />
                        <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'10px', paddingTop:'10px'}}>Test Wallet </Typography>
                        <Typography sx={{color:'#848281', fontWeight:'regular', fontSize: '16px', paddingBottom:'10px'}}>Connect to see the test wallet flow</Typography>
                        <ConnectWallet />
                      </Box>
                    </Grid>
                  </Grid>



                  {/*  PROMPT TO CONTACT IF U WANT ANOTHER WALLET AT BOTTOM*/}
                  <Box sx={{paddingTop:'50px', paddingBottom:'40px'}}>
                    <Typography>Want us to setup account recovery for a different wallet? <Link to='https://t.me/zkemail' target="_blank" >Contact Us!</Link></Typography>
                  </Box>
                </Box>

              ) : (

                /* RECOVERY FLOW! */
                <Box sx={{height:'310px', width:'800px', marginX: 'auto', background:'#FFFFFF', border:'1px solid #DDDDDD', borderRadius:'18px', marginY:'25px', paddingY: '20px', paddingX: '50px', position:'relative'}}>
                  <Box sx={{ position: 'absolute', top: '10px', right: '12px'}}>
                    <MoreInfoDialog
                      title='Recover Your Lost Recovery Enabled Wallet' 
                      message='If you forgot your lost wallet address reach out to your gaurdians, they will have the lost wallet address inside the emails they got when they agreed to be gaurdians, they can also identify the email by looking for your gaurdian message inside the email. If you forgot your gaurdian emails you can still atempt recovery'
                    />
                  </Box>
                  <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'30px', paddingTop:'20px'}}>Recover Wallet</Typography>

                  <Grid container spacing={2} sx={{textAlign:'left'}}>
                    <Grid item xs={6}>
                      <InputField label="Lost Wallet" type='text' value=" " />
                    </Grid>
                    <Grid item xs={6}>
                      <InputField label="Requested New Wallet Address" type='text' value=" " />
                    </Grid>
                  </Grid>

                  <Stack  sx={{ marginTop: '30px', width:'270px', marginX: 'auto'}}>
                    <Button>Request Wallet Transfer</Button>
                  </Stack>

                  {/* <Box sx={{display:'flex', justifyContent:'center', paddingTop:'13px'}}>
                    <Typography>Copy the link and import into your Safe wallet</Typography>
                  </Box> */}
                </Box>
              )}
            </div>







            {/* Temporarily moving components here for frontend redesign */}
            <Box sx={{marginTop:'200px'}}>
              <h2>Components below swapped based on switch (just for editing)</h2>
              {/* {renderBody()} */}

              {/* <ConnectWallets /> */}
              {/* <SafeModuleRecovery/> */}
              {/* setting up the guardians*/}
              {/* <RequestGuardian /> */}
              {/* getting the responses status from guardians*/}
              {/* <RequestGuardianStatus />  */}
              {/* <WalletGuarded/> */}
              

             
              {/* <RequestedRecoveries /> */}
              <TriggerAccountRecoveryEmails/>
              {/* trigger recovery breaks  */}
              {/* <TriggerAccountRecovery/>  */}
              {/* <PerformRecovery/> */}

  {/*The STEPS are
    CONNECT_WALLETS: 0,
    SAFE_MODULE_RECOVERY: 1,
    REQUEST_GUARDIAN: 2,
    REQUESTED_RECOVERIES: 3,
    TRIGGER_ACCOUNT_RECOVERY: 4,
  */}
  
              
            </Box>

          </div>
        </StepsContext.Provider>
      </AppContextProvider>
    </Web3Provider>
  );
}

export default App;
