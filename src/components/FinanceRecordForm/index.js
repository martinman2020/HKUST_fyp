import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES, FIN_FORM_MODE } from '../../api/CollectionFinanceAPI'
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI';
import NumberFormat from 'react-number-format';
import { BEFORE_AFTER, PERIOD_UNIT, FREQUENCY, CURRENCY } from '../../preset/preference'
import { expenseCategory } from '../../preset/expenseCategory';
import { CollectionIncomeCatAPI, INCOME_CATEGORY_ATTRIBUTES } from '../../api/CollectionIncomeCatAPI';
import { CollectionExpenseCatAPI, EXPENSE_CATEGORY_ATTRIBUTES } from '../../api/CollectionExpenseCatAPI';
import { FinanceSetChart } from '../IncomeChart';
import { MenuList } from '@mui/material';
import ListIcon from '@mui/icons-material/List';



import PropTypes from 'prop-types';

import { LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import { COLLECTION_NAME } from '../../api/database';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import CustomizedDialogs from '../CustomizedDialogs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom'
import PopupDialogFrame from '../PopupDialogFrame'


import {
    Box,
    InputLabel,
    Menu,
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
    Divider,
    AppBar,
    Toolbar,
    Snackbar,
    Alert,

} from '@mui/material'
import { textAlign } from '@mui/system';



export function FinanceRecordForm( {isShow, setIsShow, refresh, setRefresh} ) {
    const isIncome = true;
    const db_Finance = new CollectionFinanceAPI();
    const db_Preference = new CollectionPreferenceAPI();
    const db_IncomeCat = new CollectionIncomeCatAPI();
    const db_ExpenseCat = new CollectionExpenseCatAPI();
    
    const [financeData, setFinanceData] = useState({
        [FINANCE_ATTRIBUTES.DATE]: new Date().setSeconds(0),
        // [FINANCE_ATTRIBUTES.AMOUNT_OF_CATEGORY]: 0,
        [FINANCE_ATTRIBUTES.CATEGORY]: '',
        // [FINANCE_ATTRIBUTES.AMOUNT]: 0,
    });
    const [formMode, setFormMode] = useState(true);
    const [preference, setPreference] = useState();
    const [sign, setSign] = useState(); //  The state of currency prefix
    const [IncomeCategory, setIncomeCategory] = useState([]);
    const [ExpenseCategory, setExpenseCategory] = useState([]);
    const [flag, setFlag] = useState();
    const [countType, setCountType] = useState(0);
    const [finance, setFinance] = useState();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const [isSubmited, setIsSubmited] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState('');
    
    const [open, setOpen] = useState(); // dialog popup

    // const [_date, setDate] = useState(null);

    const handleSubmit = async (e)=>{
        // e.preventDefault();
        await db_Finance.addDocument(financeData);
        setIsSubmited(true);
        setSnackbarMsg('Finace Record has been added');
        setOpen(false);
        setIsShow(false);
        setRefresh(!refresh);
        setFinanceData({
            [FINANCE_ATTRIBUTES.IS_INCOME]: false,
            [FINANCE_ATTRIBUTES.AMOUNT]: 0,
            [FINANCE_ATTRIBUTES.CATEGORY]: '',
            // [FINANCE_ATTRIBUTES.DATE]: '',
            [FINANCE_ATTRIBUTES.NOTE]: ''
        })
        // window.location.reload(false);
    }
    
    useEffect(() => {
        // db_IncomeCat.initialize();
        // db_ExpenseCat.initialize();
    }, [])

    useEffect(() => {
        db_Finance.getCollection().then(item => {setFinance(item)});
        // console.log("financeData: ", financeData)
        console.log("sign: ", sign)
        console.log("flag: ", flag)
        console.log("IncomeCategory: ", IncomeCategory)
        console.log("ExpenseCategory:", ExpenseCategory)
        console.log("FINACNE_DATA: ", financeData[FINANCE_ATTRIBUTES.AMOUNT])
        // console.log("countType:", countType)
        // console.log("Finance:", finance)
        // finance.map(item => console.log("2222Finacne: ", item))
        
    }, [financeData])
    
    useEffect(() => {
        db_Preference.getCollection().then(item=>{
            setPreference(item);
            setSign(CURRENCY.find(data => data.shortName === item[0].data.currency).sign);
            setFlag(CURRENCY.find(data => data.shortName === item[0].data.currency).flag);
            
        });
    
        db_IncomeCat.getCollection().then(item => {setIncomeCategory(item)});
        db_ExpenseCat.getCollection().then(item => {setExpenseCategory(item)});
    }, [])
    

    const handleChange = (e) => {
        // console.log("F: ", financeData[FINANCE_ATTRIBUTES.CATEGORY])
        // console.log("E: ", e.target.value)
        // console.log("countTypes: ", countType + 1)
        setFinanceData({
            ...financeData, 
            [FINANCE_ATTRIBUTES.CATEGORY]: e.target.value,
            // [FINANCE_ATTRIBUTES.AMOUNT_OF_CATEGORY]: countType + 1,
        })
        
    }
    
    const IsIncomeList = () => {
        return (
            <Box sx={{ minWidth: 100 }}>
                <FormControl fullWidth>
                    <InputLabel id="income-category">Category</InputLabel>
                    <Select
                        required
                        labelId='income-category'
                        id="income-select"
                        value={financeData[FINANCE_ATTRIBUTES.CATEGORY]}
                        label="Category"
                        onChange={handleChange}
                    >
                    {IncomeCategory.map(item=>
                        <MenuItem key={item.key} value={item.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}>
                            {item.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
                        </MenuItem>
                    )}
                    </Select>
                </FormControl>
            </Box>
            /*<select onChange={handleChange} value={financeData[FINANCE_ATTRIBUTES.CATEGORY]} required>
                <option value="" >-- select an option --</option> 
                {IncomeCategory.map(item =>
                    <option key={item.key} value={item.data[INCOME_CATEGORY_ATTRIBUTES.VALUE]}>
                        {item.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
                    </option>
                )}
            </select>*/
        )
    }

    const IsExpenseList = () => {
        return (
            <Box sx={{ minWidth: 100}}>
                <FormControl fullWidth>
                    <InputLabel id="expense-category">Category</InputLabel>
                    <Select
                        labelId='expense-category'
                        id="expense-select"
                        value={financeData[FINANCE_ATTRIBUTES.CATEGORY]}
                        label="Category"
                        onChange={handleChange}
                        required
                    >
                    {ExpenseCategory.map(item=>
                        <MenuItem key={item.key} value={item.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}>
                            {item.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}
                        </MenuItem>
                    )}
                    </Select>
                </FormControl>
            </Box>


            // <select onChange={handleChange} value={financeData[FINANCE_ATTRIBUTES.CATEGORY]} required>
            //     <option value="" >-- select an option --</option> 
            //     {ExpenseCategory.map(item => 
            //         <option key={item.key} value={item.data[EXPENSE_CATEGORY_ATTRIBUTES.VALUE]}>
            //             {item.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}
            //         </option>
            //     )}
            // </select>
        )
    }

    const ListCategory = () => (
        (formMode === FIN_FORM_MODE.INCOME) ? <IsIncomeList />: <IsExpenseList /> 
    )
    const onDatepickerRef = (el) => { if (el && el.input) { el.input.inputRef.readOnly = true; } }

    const ShowDate = () => {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    // renderInput={(props) => <TextField  fullWidth {...props} />}
                    label="Date"
                    value={financeData[FINANCE_ATTRIBUTES.DATE]}
                    onChange={(e)=>(
                        setFinanceData({...financeData, [FINANCE_ATTRIBUTES.DATE]: new Date(e).setSeconds(0)})
                    )}
                    inputProps={{readOnly: true}} // disable manual input date
                    renderInput={(props) => <TextField fullWidth {...props} />}
                    // onFocus={e => e.target.blur()}
                    // dateformat="dd/MM/YYYY"
                />
            </LocalizationProvider>
            // <input type="date" onChange={(e)=>(setFinanceData({...financeData, [FINANCE_ATTRIBUTES.DATE]: e.target.value}))} />
        )
    }

    //TODO: setFinanceData, Amount MUI style with react-number-format

   function NumberFormatCustom(props) {
        const { ref, onChange, ...other } = props;
        return (
            <NumberFormat
                {...other}
                value={financeData[FINANCE_ATTRIBUTES.AMOUNT]}
                name={props.name}
                // mask={mask}
                // customInput={TextField}
                // prefix={'$'}
                // format={format || null}
                type="text"
                thousandSeparator
                onValueChange={({ value: v }) => onChange({ target: { value: v } })}
            />
            // <NumberFormat
            //     {...other}
            //     getInputRef={ref}
                
            //     onValueChange={values => {
            //         onChange({
            //         target: {
            //             name: props.name,
            //             value: values.value,
            //         }
            //         });
            //     }}
            //     thousandSeparator
            //     isNumericString
            // />
        );
    }

    const handleAmountChange = (e) => {
        setFinanceData({
            ...financeData, 
            [FINANCE_ATTRIBUTES.AMOUNT]: (parseInt(e.target.value)),
        });
    }

    // const [_test, setTest] = React.useState();

    const BootstrapDialog = styled(Dialog)(({ theme }) => ({
        '& .MuiDialogContent-root': {
          padding: theme.spacing(2),
        },
        '& .MuiDialogActions-root': {
          padding: theme.spacing(1),
        },
      }));
      
      const BootstrapDialogTitle = (props) => {
        const { children, onClose, ...other } = props;
      
        return (
          <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
              <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </DialogTitle>
        );
      };
      
      BootstrapDialogTitle.propTypes = {
        children: PropTypes.node,
        onClose: PropTypes.func.isRequired,
      };


    const handleClickOpen = () => {
        // setOpen(true);
    };
    const handleClose = () => {
        // setOpen(false);
        setIsShow(false);
        setFinanceData({
            [FINANCE_ATTRIBUTES.IS_INCOME]: false,
            [FINANCE_ATTRIBUTES.AMOUNT]: 0,
            [FINANCE_ATTRIBUTES.CATEGORY]: '',
            // [FINANCE_ATTRIBUTES.DATE]: '',
            [FINANCE_ATTRIBUTES.NOTE]: ''
        }) 
        
    };

    // handle Finance Category Page
    const directIncomeCatPage = () => {
        navigate("/income_category_page");
    }

    const directExpenseCatPage = () => {
        navigate("/expense_category_page");
    }

    const directChartPage = () => {
        navigate("/financeChart");
    }

    const handleMenuClick = (e) => {
        setAnchorEl(e.target);
    }
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };    

    return (
        <div>
            {/* snack bar show after submited finacne record form */}
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={isSubmited} autoHideDuration={5000} onClose={() => setIsSubmited(false)}>
                <Alert onClose={() => setIsSubmited(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
            {/* <Grid container spacing={2} justifyContent="flex-end">         
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="AddIcon"
                    sx={{ mr: 0.5 }}
                >
                    <AddIcon onClick={handleClickOpen}/>
                </IconButton>
            </Grid> */}
            {FormData === undefined ? 'Loading' : (
            
            // <Dialog
            // // onClose={handleClose}
            //     // aria-labelledby="customized-dialog-title"
            //     open={isShow}
            //     sx={{
            //         display: 'flex',
            //         justifyContent: 'center',
            //         alignItems: 'center'
            //     }}
            // >
            <PopupDialogFrame
                isOpen={isShow}
                title={'Finance Record Form'}
                onClose={() => handleClose()}
                onSubmit={() => handleSubmit()}
            >
            {/* <Box
                sx={{
                    width: 360,
                    padding: 3,
                    backgroundColor: '#FFF',
                    borderRadius: '10px',
                    overflow: 'auto'
                }}
            > */}
            {/* <BootstrapDialogTitle id="customized-dialog-title" onClose={() => { setIsShow(false) }} >
                Finance Record Form
            </BootstrapDialogTitle> */}

            {/* <DialogContent dividers> */}
            <Grid container spacing={2}>
                <Grid item xs={12} textAlign={'center'}>
                    <FormControl required>
                    <FormLabel id="demo-row-radio-buttons-group-label">Type</FormLabel>
                        <RadioGroup row>
                            <FormControlLabel 
                                value="income" 
                                control={<Radio color='info' required/>}  
                                onChange={(e) => (setFinanceData({...financeData, [FINANCE_ATTRIBUTES.IS_INCOME]: e.target.checked}), setFormMode(isIncome))} 
                                label="Income" 
                            />
                            <FormControlLabel 
                                value="expense" 
                                control={<Radio color='secondary' required/>}  
                                onChange={(e) => (setFinanceData({...financeData, [FINANCE_ATTRIBUTES.IS_INCOME]: e.target.defaultChecked}), setFormMode(!isIncome))}
                                label="Expense" 
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                    
                    <Grid item xs={12} textAlign={'center'}>
                        <NumberFormat
                            fullWidth
                            customInput={TextField}
                            placeholder='Amount'
                            decimalScale={2}
                            thousandSeparator={true} 
                            prefix={sign}
                            onValueChange={(e)=>{
                                const {formattedValue, value, floatValue} = e;
                                setFinanceData({...financeData, [FINANCE_ATTRIBUTES.AMOUNT]: floatValue})
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} textAlign={'center'}>
                        <ShowDate />
                    </Grid>
                    
                    <Grid item xs={12} textAlign={'center'}>
                        {(IncomeCategory !== undefined && ExpenseCategory !== undefined) ? <ListCategory /> : <div>Loading</div>}
                    </Grid>
                    
                    <Grid item xs={12} textAlign={'center'}>
                        <TextField 
                            fullWidth
                            id="filled-basic" 
                            label="Note (optional)" 
                            // placeholder='(optional)' 
                            variant="outlined" 
                            onChange={(e) => (setFinanceData({...financeData, [FINANCE_ATTRIBUTES.NOTE]: e.target.value}))}
                        />
                    </Grid>
                    {/* <Grid item xs={6} textAlign={'center'}>
                            <Button 
                                variant="contained" 
                                type='Submit' 
                                onClick={(e) => handleSubmit(e)}
                            >
                                Submit
                            </Button>
                    </Grid> */}
                    {/* <Grid item xs={6} textAlign={'center'}>
                            <Button variant="outlined" onClick={() => { 
                                setIsShow(false);
                                setFinanceData({
                                    [FINANCE_ATTRIBUTES.IS_INCOME]: false,
                                    [FINANCE_ATTRIBUTES.AMOUNT]: 0,
                                    [FINANCE_ATTRIBUTES.CATEGORY]: '',
                                    // [FINANCE_ATTRIBUTES.DATE]: '',
                                    [FINANCE_ATTRIBUTES.NOTE]: ''
                                })  
                            } }>Close</Button>
                    </Grid> */}
            </Grid>
            {/* </DialogContent> */}
            {/* // </Box> */}
            {/* // </Dialog> */}
            </PopupDialogFrame>
            )}
    </div>
    )

}