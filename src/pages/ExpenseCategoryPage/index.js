import  React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
// import { CollectionIncomeCatAPI, INCOME_CATEGORY_ATTRIBUTES } from '../../api/CollectionIncomeCatAPI'
import { CollectionExpenseCatAPI, EXPENSE_CATEGORY_ATTRIBUTES } from '../../api/CollectionExpenseCatAPI';
import { 
    Box
    , Button
    , Grid
    , Container
    , IconButton
    , Divider
    , TextField
    , AppBar
    , Toolbar
    , Typography
    , DialogContentText
    , DialogActions
    , ButtonBase

} from '@mui/material';
import { spacing } from '@mui/system';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import LoadingPage from '../../components/LoadingPage'
import { shortcutButtonStyle } from '../style/shortcutButtonStyle';
import SnackBars, { initSnackBarsOption } from '../../components/SnackBars';
import PopupDialogFrame from '../../components/PopupDialogFrame'


const DIALOG_OPTION_ATTR = {
    IS_OPEN: 'isOpen',
    TITLE: 'title',
    MESSAGE: 'message',
    COMFIRM_ACTION: 'comfirmAction',
    SELECTED_EXPENSE: 'selectedExpense'
}

const dialogInitObj = {
    [DIALOG_OPTION_ATTR.IS_OPEN]: false,
    [DIALOG_OPTION_ATTR.TITLE]: '',
    [DIALOG_OPTION_ATTR.MESSAGE]: '',
    [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: null,
    [DIALOG_OPTION_ATTR.SELECTED_EXPENSE]: null
}


function ExpenseCategoryPage() {

    // const db_IncomeCat = new CollectionIncomeCatAPI();
    const db_ExpenseCat = new CollectionExpenseCatAPI();

    // const [IncomeCatKey, setIncomeCatKey] = useState();
    // const [IncomeCat, setIncomeCat] = useState();

    const [ExpenseCatKey, setExpenseCatKey] = useState();
    const [ExpenseCat, setExpenseCat] = useState();
    const [dialogOpen, setDialogOpen] = useState();
    const [editOpen, setEditOpen] = useState(false);
    const [selectedExpenseCat, setSelectedExpenseCat] = useState(null);
    
    const navigate = useNavigate();
    const [dialogOption, setDialogOption] = useState(dialogInitObj);
    const [remainItem, setRemainItem] = useState([]);
    const [snackBarOption, setSnackBarOption] = useState(initSnackBarsOption);
    

    // const [incomeFormData, setIncomeFormData] = useState({
    //     [INCOME_CATEGORY_ATTRIBUTES.VALUE]: '',
    //     [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
    //     // [INCOME_CATEGORY_ATTRIBUTES.AMOUNT_OF_CATEGORY]: 0,
    // });

    const [expenseFormData, setExpenseFormData] = useState({
        // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: '',
        [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: '',
    });

    const updateState = async () => {
        // db_IncomeCat.getCollection().then(result=>{
        //     setIncomeCat(result); 
        //     // setIncomeCatKey(result[0].key);
        // })
        await db_ExpenseCat.getCollection().then(result=>{
            setExpenseCat(result); 
            // setExpenseCatKey(result[0].key);
        })
    }

    const checkRemainItem = () => {
        let item = 0;
        if(ExpenseCat) {
            ExpenseCat.map(_item => {
                item++;
            })
            setRemainItem(item);
        }
    }

    useEffect(() => {
        // console.log("IncomeCat ", IncomeCat);
        console.log("ExpenseCat:", ExpenseCat);
    }, [])

    useEffect(() => {
        // db_IncomeCat.initialize();
        db_ExpenseCat.initialize();
        updateState();
        // updateIncomeCatState();
        updateExpenseCatstate();
    }, [])

    useEffect(() => {
        checkRemainItem();
    }, [ExpenseCat])

    const handleEditOpen = (_selectedExpenseCat) => {
        setSelectedExpenseCat(_selectedExpenseCat);
        setEditOpen(true);
    }

    const handleEditDialogClose = () => {
        if(selectedExpenseCat) {
            setSelectedExpenseCat(null)
            setExpenseFormData({
                ...expenseFormData,
                [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]:'',
                // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]:''
            })
        }
        setEditOpen(false)
    }

    const handleDialogOpen = () => {
        setDialogOpen(true);
    }

    const handleDialogClose = () => {
        setDialogOpen(false);
        setExpenseFormData({
            ...expenseFormData,
            [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: '',
        })
    }

   const handleDeleteExpense = async (_ExpenseCat) => {
        await db_ExpenseCat.deleteDocument({label: _ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}).then(() =>
            db_ExpenseCat.getCollection().then(res => setExpenseCat(res))
        ); 
    }
    
    const handleCloseSnackBars = () => {
        setSnackBarOption({...snackBarOption, isShow: false })
    }

    const handleMenuClickDelete = (_selectedExpenseCat) => {
        // check remain list of ExpenseCat 
        if (remainItem === 1) {
            setSnackBarOption({ isShow: true, message: "At least remain one item", type: 'warning' })
        }
        else {
            setDialogOption({
                [DIALOG_OPTION_ATTR.IS_OPEN]: true,
                [DIALOG_OPTION_ATTR.MESSAGE]: 'After deleting the category, the result on the finance report will be affected.',
                [DIALOG_OPTION_ATTR.SELECTED_EXPENSE]: _selectedExpenseCat,
                [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: handleDeleteExpense,
                [DIALOG_OPTION_ATTR.TITLE]: `Are you sure to delete "${_selectedExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}" ?`
            })
        }
    }

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
    // const ListIncomeCategory = () => IncomeCat.map(_IncomeCat => (
           
    //        <div>
               
    //            <div key={_IncomeCat.key}>
    //                 <Box
    //                     sx={{
    //                         m: 1,
    //                         width: '100%',
    //                         height: 50,
    //                         borderTop: 1,
    //                         // borderRadius: 20,
    //                         // borderBottom: 1,
    //                         // border: 1,
    //                         borderColor: '#9D9FA0',
    //                         backgroundColor: 'white',
    //                         '&:hover': {
    //                             backgroundColor: '#DEE2E3',
    //                             opacity: [0.9, 0.8, 1],
    //                         },
    //                     }}
    //                 >
    //                     <Grid container justifyContent="flex-end">
    //                         <Grid item xs={3} textAlign='center'>
    //                             <IconButton color="primary" aria-label="edit">
    //                                 <EditIcon />
    //                             </IconButton>
    //                         </Grid>
    //                         <Grid item xs={7}>
    //                             {_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
    //                         </Grid>
    //                         <Grid item xs={2} textAlign='center'>
    //                             <IconButton color="error" aria-label="delete" onClick={() => { handleDeleteIncome(_IncomeCat)}}>
    //                                 <RemoveCircleOutlineIcon />
    //                             </IconButton>
    //                         </Grid>
    //                             {/* <Button
    //                                 color="error"
    //                                 // variant="contained"
    //                                 startIcon={<RemoveCircleOutlineIcon />}
    //                                 onClick={() => { handleDeleteIncome(_IncomeCat) }}
    //                             /> */}
    //                     </Grid>
                        
    //                     {/* <div>{_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}</div> */}
    //                 </Box>
    //                 {/* <li className='list'>{_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}</li>
    //                 <span style={{marginRight: 0.5 + 'em'}} ></span>
    //                 <button onClick={() => { handleDeleteIncome(_IncomeCat) }}>Delete</button> */}
    //            </div>
    //         </div>
            
    //     )
    // )
    
    const ListExpenseCategory = () => ExpenseCat.map(_ExpenseCat => (
        <div>
            <div key={_ExpenseCat.key}>
                <Box
                    sx={{
                        p: 1,
                        width: '100%',
                        height: 60,
                        borderRadius: 15,
                        backgroundColor: '#e8ecfd',
                        
                    }}
                >
                    <Grid container justifyContent="flex-end">
                        <Grid item xs={3} textAlign='center'>
                            <IconButton color="primary" aria-label="edit" onClick={() => handleEditOpen(_ExpenseCat)}>
                                <EditIcon />
                            </IconButton>
                        </Grid>

                        <Grid item xs={7}>
                            <Typography 
                                mt={1} 
                                component="div"
                                color="#2F3A55"
                                sx={{
                                    fontWeight: 'regular'
                                }}
                            >
                                {_ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}
                            </Typography>
                        </Grid>

                        <Grid item xs={2} textAlign='center'>
                            <IconButton color="error" aria-label="delete" onClick={() => { handleMenuClickDelete(_ExpenseCat)}}>
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                        </Grid>

                    </Grid>
                </Box>
                {/* <li className='list'>{_ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}</li>
                <span style={{marginRight: 0.5 + 'em'}} ></span>
                <button onClick={() => { handleDeleteExpense(_ExpenseCat) }}>Delete</button> */}
            </div>
        </div>
    ))
    
    // const updateIncomeCatState = async () => {
    //     await db_IncomeCat.getCollection().then(res => setIncomeCat(res));
    // }
    
    const updateExpenseCatstate = async () => {
        await db_ExpenseCat.getCollection().then(res => setExpenseCat(res));
    }

    // const handleAddIncomeCat = async () => {
    //     // await setIncomeFormData({ value: '', label: '', amountOfcategory: 0});
    //     await db_IncomeCat.addDocument(incomeFormData);
    //     await updateIncomeCatState();
    //     // window.location.reload(false);
    // }

    const handleAddExpenseCat = async () => {
        let checkRepeat = false; // no repeat
        if (expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] !== ''){
            ExpenseCat.forEach(_ExpenseCat => {
                if (_ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] === expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]) {
                    checkRepeat = true;
                }
            })
            if (checkRepeat === false) { // no repeat
                await db_ExpenseCat.addDocument(expenseFormData);
                await updateExpenseCatstate();
                setDialogOpen(false);
                setExpenseFormData({
                    ...expenseFormData,
                    [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: '',
                })
                setSnackBarOption({ isShow: true, message: "Add successfully", type: 'success'});
            }
            else { // has repeat
                setSnackBarOption({ isShow: true, message: "This Category is already existed", type: 'error' });
            }
        }
        else {
            setSnackBarOption({ isShow: true, message: "Please fill in the form", type: 'error' });
        }
    }
    if (selectedExpenseCat !== null && expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] === '') {
        setExpenseFormData({
            ...expenseFormData,
            [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: selectedExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL],
            // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: selectedExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.VALUE]
        })
    } 
    const handleUpdateExpenseCat = async () => {
        if (selectedExpenseCat && expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] !== '') {
            let checkUpdateRepeat = false;
            ExpenseCat.forEach(_ExpenseCat => {
                if (_ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] === expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]) {
                    if (selectedExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] === expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]) {
                        checkUpdateRepeat = false;
                    }
                    else {
                        checkUpdateRepeat = true;
                    }
                }
            })

            if (checkUpdateRepeat === false) {
                await db_ExpenseCat.overwriteDocument(selectedExpenseCat.key, expenseFormData);
                setSelectedExpenseCat(null)
                setExpenseFormData({
                    ...expenseFormData,
                    [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: '',
                    // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: ''
                })
                console.log("expenseFormData: ", expenseFormData)
                await updateExpenseCatstate();
                setEditOpen(false);
                setSnackBarOption({ isShow: true, message: "The item is updated successfully", type: 'success'});
            }
            else {
                setSnackBarOption({ isShow: true, message: "This Category is already existed", type: 'error'});
            }

        }
        else {
            console.log("error")
        }
    }


    // const handleUpdateIncomeCat = async (originalObj, updatedObj) => {
    //     await db_IncomeCat.updateDocument(originalObj.key, updatedObj);
    //     await updateIncomeCatState();
    // }

    const handleArrowClick = () => {
        navigate("/finance");
    }

    const Shortcuts = () => {
        let containerStyle = { padding: '5px' };

        let btnBgColors = {
            newExpenseCat: '#2E3B55',
        }

        return (
            <Box sx={{...containerStyle}} >
                <Grid container flex justifyContent={'space-evenly'} alignContent={'center'} flexWrap={'wrap'} justifyContent={"flex-end"}>
                    <Grid item>
                        <ButtonBase sx={{background: btnBgColors.newExpenseCat ,...shortcutButtonStyle}} onClick={() => setDialogOpen(true)}><AddIcon />Add New</ButtonBase>
                    </Grid>
                </Grid>
            </Box>
        )
    }

    return (
        
        ExpenseCat !== undefined ? (
            // <Container xs={12} sx={{
            //     paddingBottom: 12
            // }}>
            <Container xs={12} disableGutters={true} sx={{
                paddingBottom: 12
                
            }}>
            <div>
                <SnackBars {...snackBarOption} onClose={handleCloseSnackBars} />
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
                            <h4>Expense Category Setting</h4>
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Divider sx={{
                    marginTop: '10px',
                    marginBottom: '12px'
                }} />
                
                {/* <Grid container>
                    <Grid item xs={12} textAlign='right'>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="AddIcon"
                        sx={{ mr: 0.5 }}
                    >
                        <AddIcon onClick={handleDialogOpen}/>
                    </IconButton>
                    </Grid>
                </Grid> */}
                <Container>
                    <Shortcuts />
                </Container>
                {/* <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            type="text"
                            placeholder='e.g. Supermarket'
                            value={expenseFormData[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}
                            onChange={e => setExpenseFormData({
                                ...expenseFormData,
                                [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                            })}
                        />
                        <Button onClick={handleAddExpenseCat}>Submit</Button>
                    </Grid>
                </Grid> */}
                {/* <br /> */}
                <Box
                    sx={{
                        // border: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        '& > :not(style)': {
                        m: 1.5,
                        width: '360px',
                        height: 50,
                        },
                        overflow: 'auto',
                        justifyContent: 'center',

                        
                    }}
                >
                    <ListExpenseCategory />
                </Box>
                <Box 
                    sx={{
                        // border: 1,
                        height: 5
                    }}
                />   
    
            </div>
            {/* handle add expense category form open */}
            {/* <Dialog
            // onClose={handleClose}
                // aria-labelledby="customized-dialog-title"
                open={dialogOpen}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            > */}
                {/* <Box
                sx={{
                    width: 360,
                    padding: 3,
                    backgroundColor: '#FFF',
                    borderRadius: '10px',
                    overflow: 'auto'
                }}
                > */}
                    {/* <BootstrapDialogTitle id="customized-dialog-title" onClose={handleDialogClose}>
                        Add Expense Category
                    </BootstrapDialogTitle> */}
                    {/* <DialogContent dividers> */}
                <PopupDialogFrame
                    isOpen={dialogOpen}
                    title='Add Expense Category'
                    onClose={() => handleDialogClose()}
                    onSubmit={() => handleAddExpenseCat()}
                >            
                        <Grid container spacing={2}>
                                <Grid item xs={12} textAlign={'center'}>
                                    <TextField 
                                        fullWidth
                                        id="filled-basic" 
                                        label="e.g. Online Shopping" 
                                        // placeholder='(optional)' 
                                        variant="outlined" 
                                        onChange={e => setExpenseFormData({
                                            ...expenseFormData,
                                            [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                            // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                                        })}
                                    />
                                </Grid>
                                {/* <Grid item xs={6} textAlign={'center'}>
                                    <Button 
                                        variant="contained" 
                                        type='Submit' 
                                        onClick={(e) => handleAddExpenseCat(e)}
                                    >
                                        Submit
                                    </Button>
                                </Grid> */}
                                {/* <Grid item xs={6} textAlign={'center'}>
                                    <Button variant="outlined" onClick={() => handleDialogClose()}>Close</Button>
                                </Grid> */}
                            </Grid>
                    {/* </DialogContent> */}
                {/* </Box> */}

            {/* </Dialog> */}
            </PopupDialogFrame>

            {/* handle edit expense category form open */}
            {/* <Dialog
            // onClose={handleClose}
                // aria-labelledby="customized-dialog-title"
                open={editOpen}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            > */}
                {/* <Box
                sx={{
                    width: 360,
                    padding: 3,
                    backgroundColor: '#FFF',
                    borderRadius: '10px',
                    overflow: 'auto'
                }}
                > */}
                    {/* <BootstrapDialogTitle id="customized-dialog-title" onClose={() => handleEditDialogClose()}>
                        Edit Expense Category
                    </BootstrapDialogTitle> */}
                    {/* <DialogContent dividers> */}
                <PopupDialogFrame
                    isOpen={editOpen}
                    title='Edit Expense Category'
                    onClose={ () => handleEditDialogClose() }
                    onSubmit={ () => handleUpdateExpenseCat() }
                >
                        <Grid container spacing={2}>
                                <Grid item xs={12} textAlign={'center'}>
                                    <TextField 
                                        fullWidth
                                        id="filled-basic" 
                                        // label="e.g. Online Shopping" 
                                        defaultValue={selectedExpenseCat ? selectedExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL] : ''}
                                        // placeholder='(optional)' 
                                        variant="outlined" 
                                        onChange={e => setExpenseFormData({
                                            ...expenseFormData,
                                            [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                            // [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                                        })}
                                    />
                                </Grid>
                                {/* <Grid item xs={12} textAlign={'center'}>
                                    <Button 
                                        variant="contained" 
                                        type='Submit' 
                                        onClick={(e) => handleUpdateExpenseCat(e)}
                                    >
                                        Save
                                    </Button>
                                </Grid> */}
                            </Grid>
                    {/* </DialogContent> */}
                {/* </Box> */}

            {/* </Dialog> */}
            </PopupDialogFrame>


            {/* dialog for handle delete expense category*/}
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
                    <Button onClick={e => { dialogOption[DIALOG_OPTION_ATTR.COMFIRM_ACTION](dialogOption[DIALOG_OPTION_ATTR.SELECTED_EXPENSE]); setDialogOption(dialogInitObj) }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            </Container>): (<><LoadingPage title={'Loading'} description={'Please wait a moment'} /></>)
        
    )

}
export default ExpenseCategoryPage