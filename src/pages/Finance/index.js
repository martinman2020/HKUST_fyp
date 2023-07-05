import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FinanceRecordForm } from '../../components/FinanceRecordForm'
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES } from '../../api/CollectionFinanceAPI'
import NumberFormat from 'react-number-format';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import FinanceChart from '../FinanceChart';
// import { Route } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom'
import CustomizedDialogs from '../../components/CustomizedDialogs';
import ListFinanceRecord from '../../components/ListFinanceRecord';
import { testing_finance } from '../../testingData/testing';
import PageFrame, { PAGES_NAME } from '../PageFrame';
import ListIcon from '@mui/icons-material/List';
import { shortcutButtonStyle } from '../style/shortcutButtonStyle';
import { btnBgColors, commonStyle_CenterImgText } from '../../components/commonStyle';
import { IncomeExpenseChart } from '../../components/IncomeExpenseChart'
import BarChartIcon from '@mui/icons-material/BarChart';
import { CollectionIncomeCatAPI } from '../../api/CollectionIncomeCatAPI';
import { CollectionExpenseCatAPI } from '../../api/CollectionExpenseCatAPI';

import { 
    Grid,
    Paper,
    TextField, 
    Dialog, 
    DialogActions,
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Container,
    Divider,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    ButtonBase, 
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,

    
} from '@mui/material';
import FinaceMenuBtn from '../../components/FinanceMenuBtn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FinanceBalance from '../../components/FinanceBalance';
import { install } from "resize-observer";

// const useStyles = makeStyles({
//     root: {
//       background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
//     //   border: 0,
//     //   borderRadius: 100,
//     //   boxShadow: '0 3px 5px 2px rgba(255, 105, 135, 0.3)',
//       color: "white",
//     //   height: 48,
//     //   width: "70%",
//       padding: '0 10px',
//     },
//   });
install();


function Finance(){
    // const classes = useStyles();

    const [finance, setFinance] = useState();
    const navigate = useNavigate();

    const [openPopup, setOpenPopup] = useState(false); // dialog
    
    const db_finance = new CollectionFinanceAPI();
    const db_IncomeCat = new CollectionIncomeCatAPI();
    const db_ExpenseCat = new CollectionExpenseCatAPI();

    const [anchorEl, setAnchorEl] = useState(null);
    const [requestRefresh, setRequestRefresh] = useState(false);
    const menuOpen = Boolean(anchorEl);
    const [isShowCreateForm ,setIsShowCreateForm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true) 

    // if (finance === undefined) {
    //     testing_finance.map(item => db_finance.addDocument(item));
    // }

    const updateState = async () => {
        var data = await db_finance.getCollection()
        setFinance(data)
        // console.log(finance)
    }

    useEffect(() => {
        // db_IncomeCat.initialize();
        // db_ExpenseCat.initialize();
        updateState()
    }, [])

    const EditForm = (props) => {
        console.log("clicked");
    }

    const handleMenuClick = (e) => {
        setAnchorEl(e.target);
    }

    const directChartPage = () => {
        navigate("/financeChart");
    }

    //TODO: delete finance record
    const handleDeleteFinanceRecord = async (_finance) => {
        // console.log("handleDeleteFinanceReocrd!!!!!!");
        await db_finance.deleteDocument(_finance.key).then(() =>
            db_finance.getCollection().then(res => setFinance(res))
        );

    }

    const ListFinance = () => finance.map(_finance => (
        <div key={_finance.key}>
            <li>Income/Expense: {_finance.data.isIncome === true ? 'Income' : 'Expense'}</li>
            <li>Date: {new Date(_finance.data.date).toDateString().split(' ')[1] + " " 
                        + new Date(_finance.data.date).toDateString().split(' ')[2] + " "
                        + new Date(_finance.data.date).toDateString().split(' ')[3] 
            }</li>
            <li>Note: {_finance.data.note}</li>
            <li>Amount: {_finance.data.amount}</li>
            <li>Category: {_finance.data[FINANCE_ATTRIBUTES.CATEGORY]}</li>
            <Stack direction="row" spacing={2}>
                <Button 
                    variant="outlined" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteFinanceRecord(_finance)}
                >
                    Delete
                </Button>
            </Stack>
            {/* <button>Delete</button> */}
            {/* <button onClick={() => { EditForm(_finance.key) }}>Edit</button> */}
            <br />
        </div>
        )
    )
    const Shortcuts = () => {
        let containerStyle = { padding: '5px' };

        let btnBgColors = {
            directReport: '#5D2680', 
            newFinace: '#2E3B55',
        }

        return (
            <Box sx={{...containerStyle}} >
                <Grid container flex justifyContent={'space-evenly'} alignContent={'center'} flexWrap={'wrap'}>
                    <Grid item>
                        <ButtonBase sx={{background: btnBgColors.directReport ,...shortcutButtonStyle}} onClick={() => directChartPage()}><BarChartIcon /> Report </ButtonBase>
                    </Grid>
                    <Grid item>
                        <ButtonBase sx={{background: btnBgColors.newFinace ,...shortcutButtonStyle}} onClick={() => setIsShowCreateForm(true)}><AddIcon /> New Record </ButtonBase>
                    </Grid>
                </Grid>
            </Box>
        )
    }
    
    return (
        <>
            {/* <FinanceRecordForm /> */}
            {/* show the record in localbase */}
            {/* <Container xs={12} disableGutters={true} sx={{
                paddingBottom: 12
            }}> */}
            <FinanceRecordForm isShow={isShowCreateForm} setIsShow={setIsShowCreateForm} refresh={requestRefresh} setRefresh={setRequestRefresh}/>
            <PageFrame pageName={PAGES_NAME.FINANCE} rightComponent={<> <FinaceMenuBtn /> </>} >
                {/* <Divider sx={{
                    marginTop: '10px',
                    marginBottom: '12px'
                }} /> */}
                {/* <Toolbar /> */}
                <Container>
                    <Shortcuts />
                </Container>
                <Container sx={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Typography sx={{
                        marginBottom:'5px',
                        paddingLeft:'5px',
                        borderLeft: '3px solid black',
                        textAlign: 'left',
                        fontWeight: '700',
                        fontSize: '0.9em',
                    }}>ACCOUNT</Typography>
                    <FinanceBalance refreshAttr={requestRefresh} setRefreshAttr={setRequestRefresh}/>
                </Container>
                <br />
                {/* <Typography sx={{
                    marginBottom:'5px',
                    paddingLeft:'5px',
                    borderLeft: '3px solid black',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.9em',
                }}>Overview</Typography> */}
                <Paper 
                    elevation={2} 
                    justifyContent="center" 
                    sx={{ 
                        width: '100%',
                    
                    }}
                    
                >
                    {/* <Grid container >
                        <Grid item xs={12}> */}
                            <Box
                                sx={{
                                    // height: 300,
                                    // width: 500,
                                    padding: {
                                        bottom: 20,
                                    },
                                    backgroundColor: '#FFF',
                                    borderRadius: '0px',
                                    overflow: 'auto',
                                    // border: 1
                                }}
                            >
                                <IncomeExpenseChart refreshAttr={requestRefresh} setRefreshAttr={setRequestRefresh} />
                            </Box>
                        {/* </Grid> */}

                    {/* </Grid> */}
                    </Paper>
                <br />
                <Accordion
                    expanded={isExpanded}
                    onChange={
                        ()=>setIsExpanded(!isExpanded)
                    }
                >
                    <AccordionSummary
                        aria-controls="available-student-content"
                        id="available-student-header"
                        expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                        sx={{
                            background: "#2E3B55"
                        }}
                    >
                        <Typography color={'white'}>Details of Finance Record</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ListFinanceRecord refreshAttr={requestRefresh} setRefreshAttr={setRequestRefresh} />
                    </AccordionDetails>
                </Accordion>
            {/* </Container> */}
            </PageFrame>
        </>
    )
}

export default Finance
