import React,  { useState, useEffect } from 'react'
import { ExpenseChat } from '../../components/ExpenseChat'
import { IncomeChart } from '../../components/IncomeChart'
import { IncomeExpenseChart } from '../../components/IncomeExpenseChart'
import { install } from "resize-observer";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListIcon from '@mui/icons-material/List';
import { useNavigate } from 'react-router-dom';


import {
    Box,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Button,
    Stack,
    styled,
    Paper,
    Grid,
    Cont,
    Container,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Snackbar,
} from '@mui/material'



function FinanceChart() {
    install();
    const navigate = useNavigate();
    const handleArrowClick = () => {
        navigate("/finance");
    }
    return (
        
        <Container xs={12} disableGutters={true} sx={{
            paddingBottom: 12
        }}>
        <div>
            <AppBar position="static" sx={{ background: '#2E3B55' }}>
                <Toolbar>
                        <IconButton
                            size="small"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ 
                                mr: 1,
                                flexGrow: 0.05
                            }}
                            onClick={() => handleArrowClick()}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h7" componment="div" sx={{ flexGrow: 1 , mb: 2, pt: 2}}>
                            <h4>Finance Report</h4>
                        </Typography>
                        {/* <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 0.5 }}
                        >
                            <ListIcon />
                        </IconButton> */}
                </Toolbar>
            </AppBar>
            <Divider sx={{
                    marginTop: '10px',
                    marginBottom: '10px'
                }} />
            <Grid 
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justifyContent="center"
                // style={{ minHeight: '100vh' }}
                
            >
                    <Paper elevation={2} sx={{ width: '95%'}}>
                    <Grid item xs={12} >
                        <Box
                        sx={{
                            // height: 200,
                            // width: 1000,
                            padding: 0,
                            backgroundColor: '#163240',
                            borderRadius: '10px',
                            overflow: 'auto'
                        }}
                        >
                            <IncomeChart />
                        </Box>
                    </Grid>
                    </Paper>
                    <Divider sx={{
                        marginTop: '10px',
                        marginBottom: '12px'
                    }} />
                    <Paper elevation={2} sx={{ width: '95%'}}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                // height: 200,
                                // width: 360,
                                padding: 0,
                                backgroundColor: '#163240',
                                borderRadius: '10px',
                                overflow: 'auto'
                            }}
                        >
                            <ExpenseChat />
                        </Box>
                    </Grid>
                    </Paper>
                    <Divider sx={{
                        marginTop: '10px',
                        marginBottom: '12px'
                    }} />
                    {/* <Paper elevation={2} sx={{ width: '95%'}}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                // height: 300,
                                // width: 500,
                                padding: {
                                    bottom: 20,
                                },
                                backgroundColor: '#FFF',
                                borderRadius: '10px',
                                overflow: 'auto'
                            }}
                        >
                            <IncomeExpenseChart />
                        </Box>
                    </Grid>
                    </Paper> */}
            </Grid>
            
            
             
            
            
        </div>
        </Container>
    )

}

export default FinanceChart


