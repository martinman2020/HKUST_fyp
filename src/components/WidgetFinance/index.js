import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES } from '../../api/CollectionFinanceAPI';
import WidgetFrame from '../WidgetFrame'
import { 
    Box, 
    Button, 
    ButtonBase, 
    Card, 
    Grid, 
    IconButton, 
    Stack, 
    Typography 
} from '@mui/material';
import { CURRENCY } from '../../preset/preference';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES} from '../../api/CollectionPreferenceAPI';
import { borderColor } from '@mui/system';
import TabsUnstyled from '@mui/base/TabsUnstyled';
import TabsListUnstyled from '@mui/base/TabsListUnstyled';
import TabPanelUnstyled from '@mui/base/TabPanelUnstyled';
import TabUnstyled from '@mui/base/TabUnstyled';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import { FinanceRecordForm } from '../../components/FinanceRecordForm'
import AddIcon from '@mui/icons-material/Add';


export default function WidgetFinance({ parentRefresh, setParentRefresh }) {
    const db_finance = new CollectionFinanceAPI();
    const db_preference = new CollectionPreferenceAPI();
    const [finance, setFinance] = useState([]);
    const [dailyIncome, setDailyIncome] = useState(0);
    const [dailyExpense, setDailyExpense] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpense, setMonthlyExpense] = useState(0);
    const [isOpenFinanceForm, setIsOpenFinanceForm] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [sign, setSign] = useState();
    const [preference, setPreference] = useState();

    let _monthlyIncome = 0;
    let _monthlyExpense = 0;
    let _dailyIncome = 0;
    let _dailyExpense = 0;

    const calMonthlyIncome = () => {
        if (finance) {
            finance.forEach(item => {
                
                if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) {
                    if ((moment().month() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).month()) && moment().year() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).year()) {
                        
                        _monthlyIncome += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
                        // setMonthlyIncome(_monthlyIncome);
                    }
                }
            })
            // console.log("FinanceBalance:", finance);
            setMonthlyIncome(_monthlyIncome);
            // setRefreshAttr(false);
            console.log("monthlyIncome: ", monthlyIncome);
        }
    }

    const calMonthlyExpense = () => {
        if (finance) {
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
        }
        // setRefreshAttr(false);
    }

    const calDailyIncome = () => {
        if (finance) {
            finance.forEach(item => {
                if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) { // income === true
                    if ((moment().month() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).month()) &&
                        (moment().year() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).year()) &&
                        (moment().date() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).date())
                    ) {
                        _dailyIncome += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
                    }
                }
            })
            setDailyIncome(_dailyIncome)
        }
    }

    const calDailyExpense = () => {
        if (finance) {
            finance.forEach(item => {
                if (item.data[FINANCE_ATTRIBUTES.IS_INCOME] === false) { // expense === false
                    if ((moment().month() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).month()) &&
                        (moment().year() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).year()) &&
                        (moment().date() === moment(item.data[FINANCE_ATTRIBUTES.DATE]).date())
                    ) {
                        _dailyExpense += parseFloat(item.data[FINANCE_ATTRIBUTES.AMOUNT]);
                    }
                }
            })
            setDailyExpense(_dailyExpense)
        }
    }
    
    const getFinanceData = async () => {
        await db_finance.getCollection().then(result => {
            setFinance(result);
        })
    }

    useEffect(() => {
        getFinanceData();
    }, [refresh, parentRefresh])
    
    useEffect(() => {
        db_preference.getCollection().then(item => {
            setPreference(item);
            setSign(CURRENCY.find(data => data.shortName === item[0].data[PREFERENCE_ATTRIBUTES.CURRENCY]).sign);
            // setSign(CURRENCY.find(data => data.shortName === item[0].data.currency).sign);

        })
    }, [])

    useEffect(() => {
        if (finance) {
            calMonthlyIncome();
            calMonthlyExpense();
            calDailyIncome();
            calDailyExpense();
        }
    }, [finance])

    const MonthyIncomeExpense = () => {
        let titleStyle = {
            textAlign: 'center',
            fontSize: '0.9em'
        }

        let numberStyle = {
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '1.5em'
        }

        return (
            <>
                <Box 
                    sx={{
                        width: '100%',
                        height: 100
                        // border: 1
                        // top: 100,
                        // padding: '5px'
                    }}
                    // borderColor={'#000000'}
                    justifyContent={'center'}
                    margin="auto"
                    // mb={2}
                >
                    <Grid container spacing={2} justifyContent={'center'}>
                            <Grid item={6}>
                                <Typography>
                                    {moment().format('MMM YYYY')}
                                    {/* {(moment().month()+1) + "/" + moment().year()} */}
                                </Typography>
                            </Grid>
                    </Grid>
                    {/* <br />                     */}
                    <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography sx={{ ...numberStyle }}>
                                    {sign}{monthlyIncome.toLocaleString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography sx={{ ...numberStyle }}>
                                    {sign}{monthlyExpense.toLocaleString()}
                                </Typography>
                            </Grid>
                    </Grid>
                    

                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography sx={{ ...titleStyle }}
                                >Income
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ ... titleStyle }}>
                                Expense
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </>
        )
    }

    const DailyIncomeExpense = () => {
        let titleStyle = {
            textAlign: 'center',
            fontSize: '0.9em'
        }

        let numberStyle = {
            textAlign: 'center',
            fontWeight: '700',
            fontSize: '1.5em'
        }

        return (
            <>
                <Box 
                    sx={{
                        width: '100%',
                        height: 100
                        // border: 1
                        // top: 100,
                        // padding: '5px'
                    }}
                    // borderColor={'#000000'}
                    justifyContent={'center'}
                    margin="auto"
                    // mb={2}
                >
                    <Grid container spacing={2} justifyContent={'center'}>
                            <Grid item={6}>
                                <Typography>
                                    {moment().format('DD MMM, YYYY')}
                                    {/* {(moment().month()+1) + "/" + moment().year()} */}
                                </Typography>
                            </Grid>
                    </Grid>
                    {/* <br />                     */}
                    <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography sx={{ ...numberStyle }}>
                                    {sign}{dailyIncome.toLocaleString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography sx={{ ...numberStyle }}>
                                    {sign}{dailyExpense.toLocaleString()}
                                </Typography>
                            </Grid>
                    </Grid>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography sx={{ ...titleStyle }}
                                >Income
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ ... titleStyle }}>
                                Expense
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </>
        )
    }

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
      
        return (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
          >
            {value === index && (
              <Box sx={{ p: 0.5 }}>
                <Typography>{children}</Typography>
              </Box>
            )}
          </div>
        );
      }
      
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };

    function a11yProps(index) {
        return {
          id: `simple-tab-${index}`,
          'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const SwitchDailyMonthly = () => {
        const [value, setValue] = useState(0);
        const handleChange = (event, newValue) => {
            setValue(newValue);
          };

        return (
            <Box sx={{ width: '100%', m: 'auto'}}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', justifyContent: 'center'}}>
                    <Tabs 
                        value={value} 
                        onChange={handleChange} 
                        aria-lxabel="basic tabs example"
                        variant="fullWidth"
                    >
                        <Tab label="Daily" {...a11yProps(0)} />
                        <Tab label="Monthly" {...a11yProps(1)} />
                        {/* <Tab label="Monthly" {...a11yProps(2)} /> */}
                    </Tabs>
                </Box>
                <TabPanel sx={{ color: '#fff'}} value={value} index={0}>
                    <DailyIncomeExpense />
                </TabPanel>
                <TabPanel sx={{ color: '#fff'}} value={value} index={1}>
                    <MonthyIncomeExpense />
                </TabPanel>
                {/* <TabPanel sx={{ color: '#fff'}} value={value} index={2}>
                    Testing
                </TabPanel> */}
            </Box>
        )
    }

    const iconBtnStyle = {
        border: '2px #2A4359 solid',
        marginLeft: '5px',
        marginRight: '5px',
    }

    const iconBtnCaptionStyle = {
        paddingTop: '3px',
        fontSize: '0.5em',
        fontWeight: 700,
    }

    const flex = {
        display: 'flex',

    }

    const flexColumnCenterCenter = {
        ...flex,
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center'
    }

    const handleAddBtn = (e) => {
        setIsOpenFinanceForm(true)
    }

    return(
        <>
            <FinanceRecordForm isShow={isOpenFinanceForm} setIsShow={setIsOpenFinanceForm} refresh={refresh} setRefresh={setRefresh} />
            <WidgetFrame titleText='FINANCE' background='#e5efe5'>
                <SwitchDailyMonthly />

                <Box id='financeAddShortCut' sx={{ paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    {/* <Box id='addStudnetBtn' sx={{ ...flexColumnCenterCenter }}>
                    <IconButton sx={iconBtnStyle} color="primary" aria-label="search students" onClick={handleSearch}>
                    <SearchIcon />
                    </IconButton>
                    <Typography sx={iconBtnCaptionStyle}>SEARCH</Typography>
                </Box> */}

                    <Box id='addFinanceBtn' sx={{ ...flexColumnCenterCenter }}>
                        <IconButton sx={iconBtnStyle} color="primary" aria-label="add new student shortcut" onClick={handleAddBtn}>
                            <AddIcon htmlColor='#2A4359' />
                        </IconButton>
                        <Typography sx={iconBtnCaptionStyle}>ADD</Typography>
                    </Box>
                </Box>
                
            </WidgetFrame>
        </>

    )
}