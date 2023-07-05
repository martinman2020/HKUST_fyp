import React, { useState, useEffect } from 'react'

import { CURRENCY } from '../../preset/preference'
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI'
import { CollectionTuitionSetAPI, TUITION_SET_ATTRIBUTES } from '../../api/CollectionTuitionSetAPI'


import {
    Box
    , InputAdornment
    , Container
    , Grid
    , Typography
    , Button,
    TextField,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';

import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Snackbars, { initSnackBarsOption } from '../SnackBars'
import PopupDialogFrame from '../PopupDialogFrame';
import SnackBars from '../SnackBars';

export default function TuitionSetForm({ isOpen, setIsOpen }) {
    const db_tuitionSet = new CollectionTuitionSetAPI();
    const db_preference = new CollectionPreferenceAPI();


    const [tuitions, setTuitions] = useState([])    // The setting from the IndexedDB
    const [isEditable, setIsEditable] = useState(true)  // Enable the Edit mode
    const [formDate, setFormData] = useState({})  // For the form of adding new Tuition
    const [currency, setCurrency] = useState('HKD');
    const [snackBarOption, setSnackBarOption] = useState(initSnackBarsOption);


    // Fetch the tuition set from IndexedDB
    const refreshTuitionSet = () => {
        db_tuitionSet.getCollection().then(res => setTuitions(res));
    }

    const handleUpdateValue = (originalObj, updatedObj) => {
        db_tuitionSet.updateDocument(originalObj.key, updatedObj)
            .then(() => refreshTuitionSet())
    }

    // Delete a record while the delete button is pressed
    const handleDelete = (originalObj) => {
        db_tuitionSet.deleteDocument({ name: originalObj.data.name }).then(() =>
            db_tuitionSet.getCollection().then(res => setTuitions(res))
        );

    }

    const handleOnClose = ()=>{
        setIsEditable(false);
        setSnackBarOption({ ...snackBarOption, isShow: false });
    }

    // Add the record to database once the add record button is pressed 
    const handleAddRecord = () => {
        db_tuitionSet.addDocument(formDate).then(() => {
            setFormData({
                [TUITION_SET_ATTRIBUTES.NAME]: '',
                [TUITION_SET_ATTRIBUTES.PRICE]: '',
                [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: ''
            })

            setSnackBarOption({
                ...snackBarOption
                , isShow: true
                , message: 'New tuition record created'
                , type: 'success'
            })

            refreshTuitionSet()
        })
    }

    // For toggle the edit mode.
    const toggleEditablity = () => {
        setIsEditable(!isEditable);
    }


    useEffect(() => {
        db_preference.getCurrency(_currency => {
            setCurrency(_currency)
        })
        refreshTuitionSet();
    }, [])

    return (
        <>
            <SnackBars {...snackBarOption} onClose={handleOnClose} />
            <PopupDialogFrame isOpen={isOpen} title='Set Tuition' onClose={() => { setIsOpen(false) }} >
                {tuitions ? (
                    <>
                        <Box sx={{ marginBottom: 2 }}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>Creation Form</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {/* Main content */}
                                    <Container sx={{ padding: '10px 15px', marginBottom: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Set Name"
                                                    value={formDate[TUITION_SET_ATTRIBUTES.NAME]}
                                                    onChange={e => setFormData({ ...formDate, [TUITION_SET_ATTRIBUTES.NAME]: e.target.value })}
                                                />
                                            </Grid>

                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Amount"
                                                    value={formDate[TUITION_SET_ATTRIBUTES.PRICE]}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">{CURRENCY.find(item => item.shortName === currency).sign}</InputAdornment>,
                                                        endAdornment: <InputAdornment position="end">for</InputAdornment>
                                                    }}
                                                    onChange={e => setFormData({ ...formDate, [TUITION_SET_ATTRIBUTES.PRICE]: e.target.value })} />
                                            </Grid>

                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    value={formDate[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">lessons</InputAdornment>
                                                    }}
                                                    onChange={e => setFormData({ ...formDate, [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                                <Button variant='contained' onClick={handleAddRecord}>Add Record</Button>
                                            </Grid>
                                        </Grid>
                                    </Container>

                                </AccordionDetails>
                            </Accordion>
                        </Box>

                        <Box sx={{ marginBottom: 2 }}>
                        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                    <IconButton onClick={toggleEditablity} color="primary" aria-label="toggle edit mode">
                        {isEditable ? (<LockIcon />) : (<LockOpenIcon />)}
                    </IconButton>
                </Grid>

                {tuitions.length === 0 ? <p>The tuition set is empty</p> : tuitions.map(item => (
                    <Grid item xs={12} key={item.data.key} sx={{ paddingTop: '10px', paddingBottom: '10px' }} >
                        <Grid container spacing={1} >
                            <Grid item xs={10}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Name'
                                    value={item.data[TUITION_SET_ATTRIBUTES.NAME]}
                                    onChange={(e) => handleUpdateValue(item, { [TUITION_SET_ATTRIBUTES.NAME]: e.target.value })}
                                    disabled={isEditable}
                                />
                            </Grid>

                            <Grid item xs={2}>
                                {!isEditable ? (
                                    <IconButton onClick={e => handleDelete(item)} color="error" aria-label="delete tuition set">
                                        <DeleteIcon />
                                    </IconButton>
                                ) : null}
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Tuition'
                                    type="number"
                                    value={item.data[TUITION_SET_ATTRIBUTES.PRICE]}
                                    onChange={e => { handleUpdateValue(item, { [TUITION_SET_ATTRIBUTES.PRICE]: e.target.value }) }}
                                    disabled={isEditable}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{CURRENCY.find(item => item.shortName === currency).sign}</InputAdornment>,
                                        endAdornment: <InputAdornment position="end">for</InputAdornment>
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    size='small'
                                    label='Amount'
                                    type="number"
                                    value={item.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]}
                                    onChange={e => { handleUpdateValue(item, { [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: e.target.value }) }}
                                    disabled={isEditable}
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">lessons</InputAdornment>
                                    }}
                                />
                            </Grid>

                            

                        </Grid>


                    </Grid>
                ))}
            </Grid>
        </Container>
                        </Box>

                    </>
                ) : null}
            </PopupDialogFrame>
        </>
    )
}