import React, { useState, useEffect} from 'react';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES } from '../../api/CollectionFinanceAPI'
import moment from 'moment';
import { btnBgColors, commonStyle_CenterImgText } from '../../components/commonStyle';
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
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI';
import { CURRENCY } from '../../preset/preference';



function FinanceBalance({ refreshAttr, setRefreshAttr}) {
    const db_Finance = new CollectionFinanceAPI();
    const db_preference = new CollectionPreferenceAPI();
    const [finance , setFinance] = useState([]);
    const [balance, setBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [preference, setPreference] = useState();
    const [sign, setSign] = useState();
    const [preferenceKey, setPreferenceKey] = useState();
    

    let _totalIncome = 0;
    let _totalExpense = 0;
    let _balance = 0;
    let _monthlyIncome = 0;
    let _monthlyExpense = 0;

    const calMonthlyIncome = () => {
        finance.forEach(item => {
            
            if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) {
                if ((moment().month() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).month()) && moment().year() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).year()) {
                    
                    _monthlyIncome += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
                    // setMonthlyIncome(_monthlyIncome);
                }
            }
        })
        // console.log("FinanceBalance:", finance);
        setMonthlyIncome(parseFloat(_monthlyIncome));
        // setRefreshAttr(false);
        // console.log("monthlyIncome: ", monthlyIncome);
    }

    const calMonthlyExpense = () => {
        finance.forEach(item => {
            if(item.data[FINANCE_ATTRIBUTES.IS_INCOME] === false) {
                if ((moment().month() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).month()) && moment().year() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).year()) {
                    _monthlyExpense += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
                    // setMonthlyExpense(_monthlyExpense)
                }
            }
        })
        console.log("monthlyExpense: ", monthlyExpense);
        setMonthlyExpense(_monthlyExpense)
        // setRefreshAttr(false);
    }

    const calTotalIncome = () => {
        finance.forEach(item => {
            if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) {
                _totalIncome += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
            }
        })
        console.log("TotalIncome: ", totalIncome);
        setTotalIncome(_totalIncome)
    }

    const calTotalExpesne = () => {
        finance.forEach(item => {
            if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === false) {
                _totalExpense += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
            }
        })
        console.log("TotalExpense: ", totalExpense);
        setTotalExpense(_totalExpense)
    }

    const calTotalBalance = () => {
        _balance = _totalIncome - _totalExpense;
        setBalance(_balance)
        console.log("balance: ", balance);
        // return balance;
    }

    const getFinanceData = async () => {
        await db_Finance.getCollection().then(item => {
            setFinance(item);
        })
    }

    const updataState = async () => {
        await db_preference.getCollection().then(result => { 
            setPreference(result[0].data); 
            setPreferenceKey(result[0].key) 
            setSign(CURRENCY.find(data => data.shortName === result[0].data[PREFERENCE_ATTRIBUTES.CURRENCY]).sign);
        })
    }
    useEffect(() => {
        updataState()
    }, [])

    useEffect(() => {
        // db_Finance.getCollection().then(item => {
        //     setFinance(item);
        // })
        // calMonthlyIncome();
        getFinanceData();
        // calMonthlyIncome();
    }, [refreshAttr])

    
    useEffect(() => {
        // getFinanceData();
        calMonthlyIncome();
        calMonthlyExpense();
        // calMonthlyExpense();
        calTotalIncome();
        calTotalExpesne();
        calTotalBalance();
        // setMonthlyIncome(_monthlyIncome);
        console.log("monthlyIncome: ", monthlyIncome);

    }, [finance, refreshAttr])

    const BalanceSection = () => {
        let outterGridStyle = {
            borderRadius: '5px',
            overflow: 'hidden'
        }

        let innerGridStyle = {
            padding: '9px',
            color: 'white',
        }

        let titleStyle = {
            fontWeight: '600',
            fontSize: '0.7em',
        }

        let numberStyle = {
            fontWeight: '700',
            fontSize: '0.9em',
            textAlign: 'center'
        }

        return (
            <>
                {/* { calMonthlyIncome() } */}
                <Grid container sx={outterGridStyle}>
                    <Grid item xs={4} sx={{ background: btnBgColors.balance, ...innerGridStyle }}>
                        {/* <Typography sx={{ ...titleStyle }}>Balance: ${ balance.toLocaleString() }</Typography> */}
                        <Typography sx={{ ...titleStyle }}>Balance (Total)</Typography>
                        
                        <Typography sx={{ ...numberStyle }}>{sign}{balance.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ background: btnBgColors.income, ...innerGridStyle }}>
                        {/* <Typography sx={{ ...titleStyle }}>Monthly Income ({moment().format("MM/YY")}): ${monthlyIncome.toLocaleString()}</Typography> */}
                        <Typography sx={{ ...titleStyle }}>Monthly Income</Typography>
                        <Typography sx={{ ...numberStyle }}>{sign}{monthlyIncome.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ background: btnBgColors.expesne, ...innerGridStyle }}>
                        {/* <Typography sx={{ ...titleStyle }}>Monthly Expesne ({moment().format("MM/YY")}): ${monthlyExpense.toLocaleString()}</Typography> */}
                        <Typography sx={{ ...titleStyle }}>Monthly Expense</Typography>
                        <Typography sx={{ ...numberStyle }}>{sign}{monthlyExpense.toLocaleString()}</Typography>

                    </Grid>
                </Grid>

            </>
        )
    }

    return(
        <>
            {/* { calMonthlyIncome() }  */}
            {/* { calMonthlyIncome(), calMonthlyExpense(), calTotalIncome(), calTotalExpesne() } */}
            { BalanceSection() }
            {/* { calMonthlyIncome() } */}

        
        </>
    )


}
export default FinanceBalance