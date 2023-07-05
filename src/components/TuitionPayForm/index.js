import React, { useEffect, useState } from 'react';

// MUI
import {
    Dialog
    , Button
    , Paper
    , Grid
    , TextField
    , FormControl
    , InputLabel
    , Select
    , MenuItem
    , Typography
    , Box
} from '@mui/material';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';

// OUR APP
import { CollectionStudentAPI, STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI';
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES, TUITION_RECORD_STATE } from '../../api/CollectionTuitionRecordAPI';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI'
import { CollectionIncomeCatAPI, INCOME_CATEGORY_ATTRIBUTES } from '../../api/CollectionIncomeCatAPI';
import { CollectionFinanceAPI, FINANCE_ATTRIBUTES } from '../../api/CollectionFinanceAPI'
import { CURRENCY } from '../../preset/preference';
import PopupDialogFrame from '../PopupDialogFrame'

export const TUITION_PAY_OPTION_ATTR = {
    IS_OPEN: 'isOpen',
    STUDENT_KEY: 'studentKey',
    STUDENT_NAME: STUDENT_ATTRIBUTES.STUDENT_NAME,
    CLASS_KEY: 'classKey'
}

export const tuitionPayOptionInitObj = {
    [TUITION_PAY_OPTION_ATTR.IS_OPEN]: false,
    [TUITION_PAY_OPTION_ATTR.STUDENT_KEY]: null,
    [TUITION_PAY_OPTION_ATTR.STUDENT_NAME]: null,
    [TUITION_PAY_OPTION_ATTR.CLASS_KEY]: null,
}

export function TuitionPayForm({ openOptions, setOpenOptions, isSubmitted, setIsSubmitted, parentRefresh, setParentRefresh }) {
    //
    // API
    const db_tuitionRecord = new CollectionTuitionRecordAPI();
    const db_student = new CollectionStudentAPI()
    const db_preference = new CollectionPreferenceAPI();
    const db_incomeCat = new CollectionIncomeCatAPI();
    const db_finance = new CollectionFinanceAPI();

    //
    // MAPPING
    const TUITION_PAY_FORM_ATTR = {
        PAY_DATE: TUITION_RECORD_ATTRIBUTES.PAY_DATE,
        CATEGORY: FINANCE_ATTRIBUTES.CATEGORY
    }

    //
    // STATE
    const [selectedTuitionRecord, setSelectedTuitionRecord] = useState(null);

    const [incomeCategory, setIncomeCategory] = useState([]); // Income Catagories
    const [currencyObj, setCurrencyObj] = useState({});   // Currency
    const [formData, setFormData] = useState({  // Form Data
        [TUITION_PAY_FORM_ATTR.PAY_DATE]: new Date().setSeconds(0),
        [TUITION_PAY_FORM_ATTR.CATEGORY]: null
    })

    //
    // EVENT     
    // Once the tuition payment form is open
    useEffect(() => {
        if (openOptions.isOpen) {
            // get the Currency for showing the dollar sign
            db_preference.getAttribute([PREFERENCE_ATTRIBUTES.CURRENCY]).then(res => {
                setCurrencyObj(CURRENCY.filter(item => item.shortName === res)[0])
            });

            db_preference.getAttribute([PREFERENCE_ATTRIBUTES.FINANCE_TUITION_CATEGORY]).then(res => setFormData({ ...formData, [TUITION_PAY_FORM_ATTR.CATEGORY]: res }))

            // get all the income category
            db_incomeCat.getCollection().then(item => { setIncomeCategory(item) });

            // get the unpaid tuition record of selected student
            db_tuitionRecord.getCollection().then(res => {
                let temp_record = res.filter(item =>
                    item.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === openOptions[TUITION_PAY_OPTION_ATTR.CLASS_KEY]
                    && item.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === openOptions[TUITION_PAY_OPTION_ATTR.STUDENT_KEY]
                    && item.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false
                )
                setSelectedTuitionRecord(temp_record[0]);
            })
        } else {
            setOpenOptions(tuitionPayOptionInitObj);
        }
    }, [openOptions[TUITION_PAY_OPTION_ATTR.IS_OPEN]])

    //
    // EVENT HANDLER
    const handleCloseDialog = () => {
        setOpenOptions(tuitionPayOptionInitObj)
    }

    const handleSetCategoryToDefault = () => {
        db_preference.updateDocument({ name: 'preference' }, { [PREFERENCE_ATTRIBUTES.FINANCE_TUITION_CATEGORY]: formData[TUITION_PAY_FORM_ATTR.CATEGORY] })
    }

    const handleSubmit = async () => {
        setIsSubmitted(false)
        let classKey = openOptions[TUITION_PAY_OPTION_ATTR.CLASS_KEY];
        let studentKey = openOptions[TUITION_PAY_OPTION_ATTR.STUDENT_KEY];
        let userSetPayDate = formData[TUITION_PAY_FORM_ATTR.PAY_DATE];

        // update the tuitionRecord 
        await db_tuitionRecord.payTuition(classKey, studentKey, userSetPayDate).then(res => {
            console.log('TuitionPayForm : handleSubmit : res', res)
            if (!res) { console.log("ERROR: TuitionPayForm : handleSubmit : payTuition is not successful"); return }

            let amount = res.data[TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]
            let payDateTime = res.data[TUITION_RECORD_ATTRIBUTES.PAY_DATE]

            //add to finance collection
            let financeData = {
                [FINANCE_ATTRIBUTES.IS_INCOME]: true,
                [FINANCE_ATTRIBUTES.AMOUNT]: amount,
                [FINANCE_ATTRIBUTES.DATE]: payDateTime,
                [FINANCE_ATTRIBUTES.CATEGORY]: formData[TUITION_PAY_FORM_ATTR.CATEGORY],
                [FINANCE_ATTRIBUTES.NOTE]: `Tuition from ${selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]}`
            }
            db_finance.addDocument(financeData)

        }).then(() => {
            setOpenOptions(tuitionPayOptionInitObj)
            setIsSubmitted(true)
            setParentRefresh(!parentRefresh)
        })

    }


    return (
        <>
            {/**
             *  Dialog for comfirmation of hide/delete class. 
             * */}

            {/* <Dialog
                open={openOptions[TUITION_PAY_OPTION_ATTR.IS_OPEN]}
                onClose={() => {
                    setOpenOptions(tuitionPayOptionInitObj)
                }}
                aria-labelledby={`dialog-title`}
                aria-describedby={`dialog-description`}
            > */}
            <PopupDialogFrame
                title='Payment Confirmation '
                isOpen={openOptions[TUITION_PAY_OPTION_ATTR.IS_OPEN]}
                onSubmit={handleSubmit}
                onClose={() => setOpenOptions(handleCloseDialog)}
            >
                {selectedTuitionRecord ? (
                    <Box >
                        {/* <Typography variant='h5' component='h2'>Payment comfirmation</Typography> */}

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography component={'h3'}
                                    sx={{ fontSize: '0.8em' }}
                                >Student Name : </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: '500',
                                        paddingLeft: '5px',
                                        paddingTop: '3px',
                                    }}
                                >{selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component={'h3'}
                                    sx={{ fontSize: '0.8em' }}
                                >Tuition : </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: '500',
                                        paddingLeft: '5px',
                                        paddingTop: '3px',
                                    }}
                                >{currencyObj ? currencyObj.sign : null} {selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.TUITION_VALUE]} for ( {selectedTuitionRecord.data[TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON]} Lessons )</Typography>
                            </Grid>

                            <Grid item xs={12} sx={{ marginTop: '5px' }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Pay Date"
                                        value={formData[TUITION_RECORD_ATTRIBUTES.PAY_DATE]}
                                        onChange={(newValue) => {
                                            setFormData({ ...formData, [TUITION_RECORD_ATTRIBUTES.PAY_DATE]: new Date(newValue).setSeconds(0) });
                                        }}
                                        renderInput={(params) => <TextField {...params} />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={8}>
                                <FormControl
                                    fullWidth
                                >
                                    <InputLabel id="income-category">Category</InputLabel>
                                    <Select
                                        labelId='income-category'
                                        id="income-select"
                                        value={formData[FINANCE_ATTRIBUTES.CATEGORY]}
                                        label="Category"
                                        onChange={(e) => setFormData({ ...formData, [FINANCE_ATTRIBUTES.CATEGORY]: e.target.value })}
                                    >
                                        {/* FIXME: integral the income catagory */}
                                        {incomeCategory ? (
                                            incomeCategory.map(item =>
                                                <MenuItem key={item.key} value={item.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}>
                                                    {item.data[INCOME_CATEGORY_ATTRIBUTES.LABEL]}
                                                </MenuItem>
                                            ))
                                            : ''}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={4}>
                                <Button size='small' color='info' variant='contained' onClick={handleSetCategoryToDefault}>Set to default</Button>
                            </Grid>

                            {/* <Grid item xs={12}>
                                <Grid container>

                                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                                        <Button variant='contained' onClick={handleSubmit}>Confirm</Button>
                                    </Grid>

                                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                                        <Button variant='contained' color='info' onClick={handleCloseDialog}>Close</Button>
                                    </Grid>

                                </Grid>
                            </Grid> */}

                        </Grid>
                    </Box>

                ) : null}
            </PopupDialogFrame>

            {/* <DialogTitle id={`dialog-title`}>
                     {dialogOption[DIALOG_OPTION_ATTR.TITLE]}
                 </DialogTitle>
                 <DialogContent>
                     <DialogContentText id={`dialog-description`} >
                         {dialogOption[DIALOG_OPTION_ATTR.MESSAGE]}
                     </DialogContentText>
                 </DialogContent>
                 <DialogActions>
                     <Button onClick={e => setDialogOption(dialogInitObj)}>Cancel</Button>
                     <Button onClick={e => { dialogOption[DIALOG_OPTION_ATTR.COMFIRM_ACTION](dialogOption[DIALOG_OPTION_ATTR.SELECTED_CLASS]); setDialogOption(dialogInitObj) }} autoFocus>
                         Confirm
                     </Button>
                 </DialogActions> */}
            {/* </Dialog> */}


        </>
    )
}
