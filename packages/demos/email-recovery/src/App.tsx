import { createContext, useEffect, useState } from "react";
import "./App.css";
import ConnectWallets from "./components/ConnectWallets";
import NavBar from "./components/NavBar";
import RequestedRecoveries from "./components/RequestedRecoveries";
import RequestGuardian from "./components/RequestGuardian";
import SafeModuleRecovery from "./components/SafeModuleRecovery";
import TriggerAccountRecovery from "./components/TriggerAccountRecovery";
import { STEPS } from "./constants";
import { Web3Provider } from "./providers/Web3Provider";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { AppContextProvider } from "./context/AppContextProvider";
import { useTheme, Grid, Typography, Box, TextField }  from '@mui/material'
import './App.css'
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import Toggle from './components/Toggle'
import { Button } from './components/Button';
import {Link} from 'react-router-dom'


export const StepsContext = createContext(null);

type FlowType = 'setup' | 'recover';

function App() {
  const theme = useTheme();
  const [flow, setFlow] = useState<FlowType>('setup');

  const handleFlowChange = (newFlow: FlowType) => {
    setFlow(newFlow);
    console.log(flow)
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
              <Grid sx={{color:'10px', paddingTop: '200px'}}>
                <Box display='flex' justifyContent='center' sx={{borderRadius:'25.95px', border:'1px solid #CECFD2', width: '170px', marginX: 'auto', padding:'5px', marginBottom:'20px'}}>
                  <DraftsOutlinedIcon fill='black' sx={{marginX:'5px', padding:'4px'}}/>
                    ZK Email Tech
                </Box>
                <Typography variant='h1' sx={{color: theme.palette.primary.main}}>
                  Email Recovery Demo
                </Typography>   
                <Typography sx={{color: theme.palette.secondary.main, paddingTop:'15px', fontWeight:'medium', lineHeight:'140%'}}>
                    3 assigned Guardians must reply back to an email to <br></br>
                    enable wallet recovery to a new address.
                </Typography>
                <Toggle onFlowChange={handleFlowChange}/>
              </Grid>



              {flow === 'setup' ? (

                // SETUP FLOW
                <Box sx={{height:'250px', alignContent: 'center', justifyContent: 'center', marginX: 'auto'}}>
                  <Grid container>
                    {/* GNOSIS SAFE */}
                    <Grid item xs={6} padding='20px'>
                      <Box sx={{height:'250px', width:'500px', marginX: 'auto',background:'#FFFFFF', border:'1px solid #B3B3B3', borderRadius:'18px'}}>
                        <LockClockOutlinedIcon fill='black' sx={{marginTop:'25px'}}/>
                        <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'10px', paddingTop:'10px'}}>Gnosis Safe</Typography>
                        <Typography sx={{color:'#848281', fontWeight:'regular', fontSize: '16px', paddingBottom:'10px'}}>Copy the link and import into your Safe wallet</Typography>
                        <ConnectWallets/>
                        {/* <Box sx={{display:'flex'}}>
                          <InfoOutlinedIcon fill='black'/>
                          <Typography>Copy the link and import into your Safe wallet</Typography>
                        </Box> */}
                      </Box>
                    </Grid>

                    {/* TEST WALLET */}
                    <Grid item xs={6} padding='20px'>
                      <Box sx={{height:'250px',  width:'500px', marginX: 'auto', background:'#FFFFFF', border:'1px solid #B3B3B3', borderRadius:'18px'}}>
                        <AccountBalanceWalletOutlinedIcon fill='black' sx={{marginTop:'25px'}}/>
                        <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'10px', paddingTop:'10px'}}>Test Wallet </Typography>
                        <Typography sx={{color:'#848281', fontWeight:'regular', fontSize: '16px', paddingBottom:'10px'}}>Connect to see the test wallet flow</Typography>
                        <ConnectWallets/>
                        {/* <Box sx={{display:'flex'}}>
                          <InfoOutlinedIcon fill='black'/>
                          <Typography>Test out setting up a recovery wallet with a test wallet</Typography>
                        </Box> */}
                      </Box>
                    </Grid>
                  </Grid>

                  {/* BOTTOM PROMPT TO CONTACT IF U WANT ANOTHER WALLET */}
                  <Box sx={{paddingTop:'50px', paddingBottom:'40px'}}>
                    <Typography>Want us to setup account recovery for a different wallet? <Link to='https://t.me/zkemail' target="_blank" >Contact Us!</Link></Typography>
                  </Box>
                </Box>

              ) : (


                // RECOVERY FLOW
                <Box sx={{height:'250px',  width:'800px', marginX: 'auto', background:'#FFFFFF', border:'1px solid #B3B3B3', borderRadius:'18px',  marginY:'25px'}}>

                  <Typography variant='h4' sx={{fontWeight:'medium', letterSpacing: -2, paddingBottom:'10px', paddingTop:'50px'}}>Recover Wallet</Typography>


                  <Box>
                    <TextField label="Lost Wallet" />
                    <TextField label="New address" />
                  </Box>

                  <Box>
                    <Button variant='outlined' sx={{borderWidth:'1px'}}>I don’t know my guardian emails</Button>
                    <Button variant='outlined' sx={{borderWidth:'1px'}}>I know my gaudian emails</Button>
                  </Box>

                  
                  <Box sx={{display:'flex', justifyContent:'center', paddingTop:'13px'}}>
                    <InfoOutlinedIcon fill='black'/>
                    <Typography>Copy the link and import into your Safe wallet</Typography>
                  </Box>
       
                </Box>
              )}
            </div>




            {/* eesha temporaily moving components here for frontend redesign */}
            <Box sx={{marginTop:'200px'}}>
            <h2>Components below swapped based on switch(just for editing)</h2>
            {/* {renderBody()} */}
            <RequestGuardian />
            <RequestedRecoveries/>
            </Box>

          </div>
        </StepsContext.Provider>{" "}
      </AppContextProvider>
    </Web3Provider>
  );
}

export default App;
