import  React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { CollectionIncomeCatAPI, INCOME_CATEGORY_ATTRIBUTES } from '../../api/CollectionIncomeCatAPI'
// import { CollectionExpenseCatAPI, EXPENSE_CATEGORY_ATTRIBUTES } from '../../api/CollectionExpenseCatAPI';
import './style.css'
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
    , ButtonBase,

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
import LoadingPage from '../../components/LoadingPage';
import { shortcutButtonStyle } from '../style/shortcutButtonStyle';
import SnackBars, { initSnackBarsOption } from '../../components/SnackBars';
import PopupDialogFrame from '../../components/PopupDialogFrame'

const DIALOG_OPTION_ATTR = {
    IS_OPEN: 'isOpen',
    TITLE: 'title',
    MESSAGE: 'message',
    COMFIRM_ACTION: 'comfirmAction',
    SELECTED_INCOME: 'selectedIncome'
}

const dialogInitObj = {
    [DIALOG_OPTION_ATTR.IS_OPEN]: false,
    [DIALOG_OPTION_ATTR.TITLE]: '',
    [DIALOG_OPTION_ATTR.MESSAGE]: '',
    [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: null,
    [DIALOG_OPTION_ATTR.SELECTED_INCOME]: null
}

function IncomeCategoryPage() {

    const db_IncomeCat = new CollectionIncomeCatAPI();
    // const db_ExpenseCat = new CollectionExpenseCatAPI();

    const [IncomeCatKey, setIncomeCatKey] = useState();
    const [IncomeCat, setIncomeCat] = useState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedIncomeCat, setSelectedIncomeCat] = useState(null);
    // const [editDialogOpen, setEditDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [dialogOption, setDialogOption] = useState(dialogInitObj);
    const [remainItem, setRemainItem] = useState([]);
    const [snackBarOption, setSnackBarOption] = useState(initSnackBarsOption);
    // const [refresh, setRefresh] = useState(false);
    

    // const [ExpenseCatKey, setExpenseCatKey] = useState();
    // const [ExpenseCat, setExpenseCat] = useState();
    
    const [incomeFormData, setIncomeFormData] = useState({
        // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: '',
        [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
        // [INCOME_CATEGORY_ATTRIBUTES.AMOUNT_OF_CATEGORY]: 0,
    });

    // const [expenseFormData, setExpenseFormData] = useState({
    //     [EXPENSE_CATEGORY_ATTRIBUTES.VALUE]: '',
    //     [EXPENSE_CATEGORY_ATTRIBUTES.LABEL]: '',
    // });

    const updateState = async () => {
        await db_IncomeCat.getCollection().then(result=>{
            setIncomeCat(result); 
            // setIncomeCatKey(result[0].key);
        })
        // db_ExpenseCat.getCollection().then(result=>{
        //     setExpenseCat(result); 
        //     // setExpenseCatKey(result[0].key);
        // })
    }
    
    const checkRemainItem = () => {
        let item = 0;
        if(IncomeCat) {
            IncomeCat.map(_item => {
                item++;
            })
            setRemainItem(item);
        }
    }

    useEffect(() => {
        console.log("IncomeCat ", IncomeCat);
        // console.log("ExpenseCat:", ExpenseCat);
    }, [])

    useEffect(() => {
        db_IncomeCat.initialize();
        // db_ExpenseCat.initialize();
        updateState();
        updateIncomeCatState();
        // checkRemainItem();
        
    }, [])

    useEffect(() => {
        checkRemainItem();
    }, [IncomeCat])
    
    const handleEditOpen = (_selectedIncomeCat) => {
        setSelectedIncomeCat(_selectedIncomeCat);
        // Init selected income category to incomeFormData state
        
        // console.log("selectedIncomeCat: ", selectedIncomeCat);
        // if (selectedIncomeCat !== null && incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL] === "" && incomeFormData[INCOME_CATEGORY_ATTRIBUTES.VALUE] === "") {
        //     setIncomeFormData({
        //         ...incomeFormData,
        //         [INCOME_CATEGORY_ATTRIBUTES.LABEL]: selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL],
        //         [INCOME_CATEGORY_ATTRIBUTES.VALUE]: selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.VALUE]
        //     })
        // } 
        setEditOpen(true);
        // console.log("selectedIncomeCat: ", selectedIncomeCat);
        // console.log("editOpen: ", editOpen);
    }
    
    const handleEditDialogClose = () => {
        if(selectedIncomeCat) {
            setSelectedIncomeCat(null)
            setIncomeFormData({
                ...incomeFormData,
                [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
                // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: ''
            })
        }
        setEditOpen(false)
        
    }

    const handleDialogOpen = () => {
        setDialogOpen(true);
    }
    
    const handleDialogClose = () => {
        setDialogOpen(false);
        setIncomeFormData({
            ...incomeFormData,
            [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
            // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: ''
        })
    }


    const handleDeleteIncome = async (_IncomeCat) => {
        await db_IncomeCat.deleteDocument({label: _IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}).then(() =>
            db_IncomeCat.getCollection().then(res => setIncomeCat(res))
        ); 
    }
    
    const handleCloseSnackBars = () => {
        setSnackBarOption({...snackBarOption, isShow: false })
    }
    const handleMenuClickDelete = (_selectedIncomeCat) => {
        // check remain list of incomeCat
        if (remainItem === 1) { // Delete action forbiden if the item remain one
            setSnackBarOption({ isShow: true, message: "At least remain one item", type: 'warning' })
            console.log("cant delete!");
        }
        else {
            setDialogOption({
                [DIALOG_OPTION_ATTR.IS_OPEN]: true,
                [DIALOG_OPTION_ATTR.MESSAGE]: 'After deleting the category, the result on the finance report will be affected.',
                [DIALOG_OPTION_ATTR.SELECTED_INCOME]: _selectedIncomeCat,
                [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: handleDeleteIncome,
                [DIALOG_OPTION_ATTR.TITLE]: `Are you sure to delete "${_selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}" ?`
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
//    const handleDeleteExpense = async (_ExpenseCat) => {
//         await db_ExpenseCat.deleteDocument({value: _ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.VALUE]}).then(() =>
//             db_ExpenseCat.getCollection().then(res => setExpenseCat(res))
//         ); 
//     }
    
    const ListIncomeCategory = () => IncomeCat.map(_IncomeCat => (
           
           <div>
               <div key={_IncomeCat.key}>
                    <Box
                        sx={{
                            p: 1,
                            width: '100%',
                            height: 60,
                            // borderTop: 1,
                            borderRadius: 15,
                            // borderBottom: 1,
                            // border: 0.5,
                            // borderColor: '#000000',
                            // justifyContent: 'center',
                            display: 'flex',
                            backgroundColor: '#e8ecfd',
                            // '&:hover': {
                            //     backgroundColor: '#DEE2E3',
                            //     opacity: [0.9, 0.8, 1],
                            // },
                            
                        }}
                    >
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={3} textAlign='center'>
                                <IconButton color="primary" aria-label="edit" onClick={ () => { handleEditOpen(_IncomeCat)} }>
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
                                    {_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
                                </Typography>
                            </Grid>
                            <Grid item xs={2} textAlign='center'>
                                <IconButton color="error" aria-label="delete" onClick={() => { handleMenuClickDelete(_IncomeCat)}}>
                                    <RemoveCircleOutlineIcon />
                                </IconButton>
                            </Grid>
                                {/* <Button
                                    color="error"
                                    // variant="contained"
                                    startIcon={<RemoveCircleOutlineIcon />}
                                    onClick={() => { handleDeleteIncome(_IncomeCat) }}
                                /> */}
                        </Grid>
                        
                        {/* <div>{_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}</div> */}
                    </Box>
                    {/* <li className='list'>{_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}</li>
                    <span style={{marginRight: 0.5 + 'em'}} ></span>
                    <button onClick={() => { handleDeleteIncome(_IncomeCat) }}>Delete</button> */}
               </div>
            </div>
            
        )
    )
    
    // const ListExpenseCategory = () => ExpenseCat.map(_ExpenseCat => (
    //     <div>
    //         <div key={_ExpenseCat.key}>
    //             <li className='list'>{_ExpenseCat.data[EXPENSE_CATEGORY_ATTRIBUTES.LABEL]}</li>
    //             <span style={{marginRight: 0.5 + 'em'}} ></span>
    //             <button onClick={() => { handleDeleteExpense(_ExpenseCat) }}>Delete</button>
    //         </div>
    //     </div>
    // ))
    
    const updateIncomeCatState = async () => {
        await db_IncomeCat.getCollection().then(res => setIncomeCat(res));
    }
    
    // const updateExpenseCatstate = async () => {
    //     await db_ExpenseCat.getCollection().then(res => setExpenseCat(res));
    // }

    const handleAddIncomeCat = async () => {
        // await setIncomeFormData({ value: '', label: '', amountOfcategory: 0});
        let checkRepeat = false; // no repeat
        if(incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL] !== '') {
            IncomeCat.forEach(_IncomeCat => {
                console.log("incomeCat.data: ", _IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]);
                if (_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL] === incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL]) {
                    // setSnackBarOption({ isShow: true, message: "This Category is already existed", type: 'error '});
                    checkRepeat = true;
                }
            })
            if (checkRepeat === false) { // no repeat
                await db_IncomeCat.addDocument(incomeFormData);
                await updateIncomeCatState();
                setDialogOpen(false);
                setIncomeFormData({
                    ...incomeFormData,
                    [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
                    // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: ''
                })
                setSnackBarOption({ isShow: true, message: "Add successfully", type: 'success'});
            }
            else { // has repeat
                setSnackBarOption({ isShow: true, message: "This Category is already existed", type: 'error'});
            }
        }
        else { // the textfeild is empty
            setSnackBarOption({ isShow: true, message: "Please fill in the form", type: 'error' });
        }
    }

    // Init selected income category to incomeFormData state
    if (selectedIncomeCat !== null && incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL] === '') {
        setIncomeFormData({
            ...incomeFormData,
            [INCOME_CATEGORY_ATTRIBUTES.LABEL]: selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL],
            // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.VALUE]
        })
    } 
    
    const handleUpdateIncomeCat = async () => {
        if (selectedIncomeCat && incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL] !== '') {
            let checkUpdateRepeat = false; // no repeat
            IncomeCat.forEach(_IncomeCat => {
                if(_IncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL] === incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL]) {
                    if (selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL] === incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL]) {
                        // console.log("checkUpdateRepeat: false"); 
                        checkUpdateRepeat = false;
                    }
                    else {
                        // console.log("checkUpdateRepeat: true"); 
                        checkUpdateRepeat = true;
                    }
                }
            })
            if (checkUpdateRepeat === false) { // no repeat
                console.log("selectedIncomeCat: ", selectedIncomeCat, "  : incomeFormData: ", incomeFormData)
                await db_IncomeCat.overwriteDocument(selectedIncomeCat.key, incomeFormData);
                setSelectedIncomeCat(null)
                setIncomeFormData({
                    ...incomeFormData,
                    [INCOME_CATEGORY_ATTRIBUTES.LABEL]: '',
                    // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: ''
                })
                console.log("FormData: ", incomeFormData)
                await updateIncomeCatState();
                setEditOpen(false);
                setSnackBarOption({ isShow: true, message: "The item is updated successfully", type: 'success'});
            }
            else { // has repeat
                // console.log("AHUSUAHSUAHSUSAI: ", selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]);
                // console.log("aihsdiahsidiash: ", incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL]);
                setSnackBarOption({ isShow: true, message: "This Category is already existed", type: 'error'});
            }
        }
        else {
            console.log("error")
        }
    }
    // const handleAddExpenseCat = async () => {
    //     await db_ExpenseCat.addDocument(expenseFormData);
    //     await updateExpenseCatstate();
    // }

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
            newIncomeCat: '#2E3B55',
        }

        return (
            <Box sx={{...containerStyle}} >
                <Grid container flex justifyContent={'space-evenly'} alignContent={'center'} flexWrap={'wrap'} justifyContent={"flex-end"}>
                    <Grid item>
                        <ButtonBase sx={{background: btnBgColors.newIncomeCat ,...shortcutButtonStyle}} onClick={() => setDialogOpen(true)}><AddIcon />Add New</ButtonBase>
                    </Grid>
                </Grid>
            </Box>
        )
    }

    return (
        
        (IncomeCat) !== undefined ? (
            // <Container xs={12} sx={{
            //     paddingBottom: 12
            // }}>
            
            <Container xs={12} disableGutters={true} sx={{
                paddingBottom: 12
                
            }}>
            <div>
                <SnackBars {...snackBarOption} onClose={handleCloseSnackBars} />
                <AppBar position="static" sx={{ background: '#2E3B55'}}>
                    <Toolbar varient="regular">
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
                        <Typography variant="h7" component="div" sx={{ flexGrow: 1 , mb: 2, pt: 2}}>
                            <h4>Income Category Setting</h4>
                        </Typography>
                        {/* <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="AddIcon"
                            sx={{ mr: 0.5 }}
                        >
                            <AddIcon />
                        </IconButton> */}
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
                {/* <Box 
                    sx={{
                        // border: 1,
                        height: 100
                    }}
                /> */}
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
                        onClick={() => handleDialogOpen()}
                    >
                        <AddIcon />
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
                            placeholder='e.g. Pocket Money' 
                            value={incomeFormData[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
                            onChange={e => setIncomeFormData({
                                ...incomeFormData, 
                                [INCOME_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                [INCOME_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                            })}
                        />
                        <Button onClick={handleAddIncomeCat}>Submit</Button>
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
                    <ListIncomeCategory />
                        
                </Box>
                <Box 
                    sx={{
                        // border: 1,
                        height: 5
                    }}
                />          
                
            </div>

            {/* handle add income category form open */}
            
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
                        Add Income Category
                    </BootstrapDialogTitle> */}
                    {/* <DialogContent dividers> */}
                <PopupDialogFrame
                    isOpen={dialogOpen}
                    title={'Add Income Category'}
                    onClose={() => handleDialogClose()}
                    onSubmit={() => handleAddIncomeCat()}
                >
                        <Grid container spacing={2}>
                            <Grid item xs={12} textAlign={'center'}>
                                <TextField 
                                    fullWidth
                                    id="filled-basic" 
                                    label="e.g. Private Class" 
                                    // placeholder='(optional)' 
                                    variant="outlined" 
                                    onChange={e => setIncomeFormData({
                                        ...incomeFormData, 
                                        [INCOME_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                        // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                                    })}
                                />
                            </Grid>
                            {/* <Grid item xs={6} textAlign={'center'}>
                                <Button 
                                    variant="contained" 
                                    type='Submit' 
                                    onClick={(e) => handleAddIncomeCat(e)}
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


            {/* handle update income category */}
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
                        Edit Income Category
                    </BootstrapDialogTitle> */}
                    {/* <DialogContent dividers> */}
                <PopupDialogFrame
                    isOpen={editOpen}
                    title={'Edit Income Category'}
                    onClose={() => handleEditDialogClose()}
                    onSubmit={() => handleUpdateIncomeCat()}
                >
                        <Grid container spacing={2}>
                            <Grid item xs={12} textAlign={'center'}>
                                <TextField 
                                    fullWidth
                                    id="filled-basic" 
                                    // label="e.g. Private Class" 
                                    defaultValue={selectedIncomeCat ? selectedIncomeCat.data[INCOME_CATEGORY_ATTRIBUTES.LABEL] : ''}
                                    // placeholder='(optional)' 
                                    variant="outlined" 
                                    onChange={e => setIncomeFormData({
                                        ...incomeFormData, 
                                        [INCOME_CATEGORY_ATTRIBUTES.LABEL]: e.target.value,
                                        // [INCOME_CATEGORY_ATTRIBUTES.VALUE]: e.target.value.toLowerCase(),
                                    })}
                                />
                            </Grid>
                            {/* <Grid item xs={12} textAlign={'center'}>
                                <Button 
                                    variant="contained" 
                                    type='Submit' 
                                    onClick={(e) => handleUpdateIncomeCat(e)}
                                >
                                    SAVE
                                </Button>
                            </Grid> */}
                            {/* <Grid item xs={6} textAlign={'center'}>
                                <Button variant="outlined" onClick={() => handleEditDialogClose()}>Close</Button>
                            </Grid> */}
                        </Grid>
                    {/* </DialogContent> */}
                        
                {/* </Box> */}
            {/* </Dialog> */}
            </PopupDialogFrame>


            {/* dialog for handling delete income category*/}
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
                    <Button onClick={e => { dialogOption[DIALOG_OPTION_ATTR.COMFIRM_ACTION](dialogOption[DIALOG_OPTION_ATTR.SELECTED_INCOME]); setDialogOption(dialogInitObj) }} autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
            </Container> ) : (<><LoadingPage title={'Loading'} description={'Please wait a moment'} /></>)
        
    )
    
    
    

}
export default IncomeCategoryPage