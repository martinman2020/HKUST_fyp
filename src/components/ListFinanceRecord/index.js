import React, { useState, useEffect } from 'react';
import { DataGrid, getDataGridUtilityClass, GridToolbar } from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES } from '../../api/CollectionFinanceAPI';
import moment from 'moment';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI';
import { CURRENCY } from '../../preset/preference';
import { 
    Box
    , Button
    , Grid
    , Container
    , IconButton
    , Divider
    , AppBar
    , TextField
    , Toolbar
    , Typography
    , DialogContentText
    , DialogActions
    , ButtonBase

} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import { GridOverlay } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';



const DIALOG_OPTION_ATTR = {
    IS_OPEN: 'isOpen',
    TITLE: 'title',
    MESSAGE: 'message',
    CONFIRM_ACTION: 'confirmAction',
    SELECTED_RECORD: 'selectRecord'
}

const dialogInitObj = {
    [DIALOG_OPTION_ATTR.IS_OPEN]: false,
    [DIALOG_OPTION_ATTR.TITLE]: '',
    [DIALOG_OPTION_ATTR.MESSAGE]: '',
    [DIALOG_OPTION_ATTR.CONFIRM_ACTION]: null,
    [DIALOG_OPTION_ATTR.SELECTED_RECORD]: null
}


const VISIBLE_FIELDS = ['Date', 'Type', 'Amount'];

export default function ListFinanceRecord({ refreshAttr, setRefreshAttr }) {

    const [finance, setFinance] = useState([]);
    const [preference, setPreference] = useState();
    const [sign, setSign] = useState();
    const [preferenceKey, setPreferenceKey] = useState();
    const [dialogOption, setDialogOption] = useState(dialogInitObj);


    const db_finance = new CollectionFinanceAPI();
    const db_preference = new CollectionPreferenceAPI();

    const updateState = async () => {
        var data = await db_finance.getCollection()
        setFinance(data)
        // console.log(finance)
        await db_preference.getCollection().then(result => { 
            setPreference(result[0].data); 
            setPreferenceKey(result[0].key) 
            setSign(CURRENCY.find(data => data.shortName === result[0].data[PREFERENCE_ATTRIBUTES.CURRENCY]).sign);
        })

    }
    const getData = async() => {
        db_finance.getCollection().then(FinanceData => {
            setFinance(FinanceData)
        })
        
    }
    useEffect(() => {
        updateState()
        
    }, [])

    useEffect(() => {
        getData();
        // db_preference.getCollection(item => {
        //     setPreference(item)
        //     setSign(CURRENCY.find(data => data.shortName === item[0].data[PREFERENCE_ATTRIBUTES.CURRENCY]).sign);
        // })
    }, [refreshAttr])

    // console.log("Preference: ", item[0].data[PREFERENCE_ATTRIBUTES.CURRENCY])
    // console.log("Currency sign: ", CURRENCY.shortName);
    
    const handleDeleteFinanceRecord = async (key) => {
        console.log("handleDeleteFinanceReocrd!!!!!!");
        
        await db_finance.deleteDocument(key).then(() =>
            db_finance.getCollection().then(res => { 
                setFinance(res);
                setRefreshAttr(!refreshAttr);
            })
        );

    }

    const handleClickDeleteBtn = (_selectedFinanceRecord) => {
        setDialogOption({
            [DIALOG_OPTION_ATTR.IS_OPEN]: true,
            [DIALOG_OPTION_ATTR.MESSAGE]: '',
            [DIALOG_OPTION_ATTR.SELECTED_RECORD]: _selectedFinanceRecord,
            [DIALOG_OPTION_ATTR.CONFIRM_ACTION]: handleDeleteFinanceRecord,
            [DIALOG_OPTION_ATTR.TITLE]: 'Are you sure you want to delete this record?'
        })
    }

    const columns = [
        
        // {   field: 'id', 
        //     headerName: 'ID', 
        //     width: 0,    
        // },
        {
            field: 'Action',
            headerName: '',
            width: 10,
            renderCell: (params) => {
                return (
                    <div>
                        <Tooltip title="Delete">
                            <Button 
                                // variant="outlined" 
                                startIcon={<DeleteIcon />}
                                onClick={() => handleClickDeleteBtn(params.row.key)}
                            >
                            </Button>
                        </Tooltip>
                    </div>
                )
            }
        },
        {
            field: 'Date',
            headerName: 'Date',
            width: 100,
            editable: false,
        },
        // {
        //     field: 'Type',
        //     headerName: 'Type',
        //     width: 80,
        //     editable: false,
        // },
        {
            field: 'Amount',
            headerName: 'Amount',
            type: 'number',
            width: 80,
            editable: false,
        },
        {
            field: 'Category',
            headerName: 'Category',
            width: 150,
            editable: false,
        },
        // {
        //     field: 'Action',
        //     headerName: '',
        //     width: 30,
        //     renderCell: (params) => {
        //         return (
        //             <div>
        //                 <Tooltip title="Delete">
        //                     <Button 
        //                         // variant="outlined" 
        //                         startIcon={<DeleteIcon />}
        //                         onClick={() => handleDeleteFinanceRecord(params.row.key)}
        //                     />
        //                 </Tooltip>
        //             </div>
        //         )
        //     }
        // },
        
    ];
        

        
    const rows = [];
        
    console.log("finacne: ", finance);

    console.log("Moment: ", moment(1644436200000).format('DD/MM/YYYY'));
    finance.map((_finance, idx) => {
        // return {id: idx + 1, ..._finance}
        rows.push({
            id: idx + 1,
            key: _finance.key,
            Date: moment((_finance.data[FINANCE_ATTRIBUTES.DATE])).format('YYYY/MM/DD'),
            Type: (_finance.data[FINANCE_ATTRIBUTES.IS_INCOME] === true) ? 'Income' : 'Expense',
            Amount: sign + (_finance.data[FINANCE_ATTRIBUTES.AMOUNT]).toLocaleString(), // To change currency dollar sign
            Category: _finance.data[FINANCE_ATTRIBUTES.CATEGORY],
        })
    })
    // rows.map((item, idx) => {
    //     return { id: idx}
    // })

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

    console.log("rows: ", rows)

    const incomeRows = []
    const expenseRows = []
    if (rows) {
        rows.forEach((_finance, idx) => {
            if(rows[idx].Type === "Income") {
                incomeRows.push({
                    id: idx + 1,
                    key: rows[idx].key,
                    Date: rows[idx].Date,
                    Type: rows[idx].Type,
                    Amount: rows[idx].Amount,
                    Category: rows[idx].Category
                })
            }
            else {
                expenseRows.push({
                    id: idx + 1,
                    key: rows[idx].key,
                    Date: rows[idx].Date,
                    Type: rows[idx].Type,
                    Amount: rows[idx].Amount,
                    Category: rows[idx].Category
                })
            }
        })
    }
    console.log("incomeRows: ", incomeRows)
    console.log("expenseRows: ", expenseRows)
    console.log("incomeRows: ", incomeRows.length)
    console.log("expenseRows: ", expenseRows.length)
    console.log("finance", finance.length)
    console.log("Total_length: ", incomeRows.length + expenseRows.length)

    const checkDataInit = () => {
        // console.log("incomeRows: ", incomeRows.length)
        // console.log("expenseRows: ", expenseRows.length)
        // console.log("financeRows", finance.length)
        if (incomeRows.length > 0 && expenseRows.length > 0 && finance.length > 0) {
            if (incomeRows.length + expenseRows.length === finance.length) {
                
                return true;
            }
            else {
                return false;
            }
        }

        // return ((incomeRows.length + expenseRows.length)) === finance.length ? false : true;
    }

    const CustomLoadingOverlay = () => {
        return (
          <GridOverlay>
            <div style={{ position: 'absolute', top: 0, width: '100%' }}>
              <LinearProgress />
            </div>
          </GridOverlay>
        );
    }

    const SwitchIncomeExpense = () => {
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
                    >
                            <Tab label="Income" {...a11yProps(0)} />
                            <Tab label="Expense" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            // components={{
                            //     LoadingOverlay: CustomLoadingOverlay,
                            // }}
                            // components={{
                            //     Toolbar: GridToolbar
                            // }}
                            // getRowId={ (rows) => rows._id }
                            rows={incomeRows}
                            columns={columns}
                            pageSize={9}
                            // rowsPerPageOptions={[25]} 
                            // loading={() => checkDataInit()}
                            rowHeight={52}
                            // getRowId={rows => rows}
                            // checkboxSelection
                            // disableSelectionOnClick
                            disableColumnSelector
                            initialState={{
                                sorting: {
                                  sortModel: [{ field: 'Date', sort: 'desc' }],
                                },
                            }}
                            // autoHeight={true}
                        />
                    </div>
                </TabPanel>
                <TabPanel value={value} index={1}>
                <div style={{ height: 600, width: '100%' }}>
                        <DataGrid
                            
                            // components={{
                            //     Toolbar: GridToolbar
                            // }}
                            // getRowId={ (rows) => rows._id }
                            rows={expenseRows}
                            columns={columns}
                            pageSize={9}
                            // rowsPerPageOptions={[25]} 
                            // loading={checkDataInit}
                            rowHeight={52}
                            // getRowId={rows => rows}
                            // checkboxSelection
                            // disableSelectionOnClick
                            disableColumnSelector
                            initialState={{
                                sorting: {
                                  sortModel: [{ field: 'Date', sort: 'desc' }],
                                },
                            }}
                            // autoHeight={true}
                        />
                    </div>
                </TabPanel>
            </Box>
        )
    }
    
    return (
        <>
            <SwitchIncomeExpense />

            {/* dialog for handle delete Finance Record */}
            <Dialog
                open={dialogOption[DIALOG_OPTION_ATTR.IS_OPEN]}
                onClose={() => setDialogOption(dialogInitObj)}
                aria-labelledby={`dialog-title`}
                aria-describedby={`dialog-description`}
            >
                <DialogTitle id={`dialog-title`}>
                    {dialogOption[DIALOG_OPTION_ATTR.TITLE]}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id={`dialog-description`} >
                        {dialogOption[DIALOG_OPTION_ATTR.MESSAGE]}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={e => setDialogOption(dialogInitObj)}>Cancel</Button>
                    <Button onClick={e => { dialogOption[DIALOG_OPTION_ATTR.CONFIRM_ACTION](dialogOption[DIALOG_OPTION_ATTR.SELECTED_RECORD]); setDialogOption(dialogInitObj) }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    );
}