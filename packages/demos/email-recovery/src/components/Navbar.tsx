/*
NOTES: 
- do a prop for header if it's the set vs recover flow
*/


import React from 'react';
import { useTheme } from '@mui/material/styles';
import {AppBar, Grid} from '@mui/material/';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Web3Provider } from "../providers/Web3Provider";
import { ConnectKitButton } from "connectkit";



const NavBar: React.FC = () => {
    const theme = useTheme();

    return (
        <>
            <AppBar
                position="static"
                sx={{
                    width: '100%',
                    backgroundColor: 'white',
                    paddingY: '0px',
                    boxShadow: {
                        xs: 'none', // No box shadow on small screens
                        md: '0px 1px 7px rgba(0, 0, 0, 0.02)', // Box shadow on medium and larger screens
                    },
                    zIndex: '10',
                    position: 'relative',
                    borderBottom:'0.5px solid black'
                }}
            >
                <Grid container sx={{ justifyContent: 'space-between'}}>
                  <Grid item xs={2} sx={{ borderRight:'1px solid black',  paddingY:'10px'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <MailOutlineIcon  style={{ fill: '#000000' }}/>
                        {/* <img src="path_to_logo" alt="Logo" style={{ marginRight: theme.spacing(2) }} /> */}
                        <Typography variant="h6" color="black">ZKEmail</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sx={{borderRight:'0.5px solid black', paddingLeft:'25px', paddingY:'10px'}}>
                      <Box sx={{ display: 'flex', alignItems: 'center',  }}>
                        <Button color='primary' href='https://prove.email/' sx={{marginRight: theme.spacing(2), textTransform:'none'}}>Home</Button>
                        <Button color="primary" href='https://prove.email/blog' target='_blank' sx={{marginRight: theme.spacing(2), textTransform:'none' }}>Blog</Button>
                        <Button color="primary" href='https://zkemail.gitbook.io/zk-email' target='_blank'sx={{ marginRight: theme.spacing(2), textTransform:'none' }}>Docs</Button>
                        <Button color="primary" href='https://prove.email/projects' target='_blank' sx={{ marginRight: theme.spacing(2), textTransform:'none' }}>Demos</Button>
                        <Button color="primary" href='https://t.me/zkemail' target='_blank' sx={{ marginRight: theme.spacing(2), textTransform:'none' }}>Contact</Button>
                    </Box>
                  </Grid>
                  <Grid item xs={4} sx={{ paddingY:'10px',  margin: 'auto'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto'}}>
                        <Button variant="outlined" sx={{ marginRight: theme.spacing(2) ,textTransform:'none'}}>Check out Demo</Button>
                        <ConnectKitButton />
                    </Box>
                  </Grid>
                </Grid>
            </AppBar>
        </>
    );
};

export default NavBar;
