import React, { useState, useEffect } from 'react';

import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { CollectionAttendanceAPI } from '../../api/CollectionAttendanceAPI';

import moment from 'moment';

import {
    CircularProgress
    , Box
    , Container
    , Grid
    , Paper
    , Stack
    , Typography
    , Button
    , Dialog
    , DialogTitle
    , DialogContent
    , DialogContentText
    , DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles'

import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import PageviewIcon from '@mui/icons-material/Pageview';


import { commonStyle_vCenterImgText } from '../commonStyle'
import { FREQUENCY } from '../../api/CollectionPreferenceAPI';
import { ClassDetail } from '../ClassDetail'
import { ClassCreateForm } from '../ClassCreateForm';
import { STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI';
import { CollectionStudentAttendanceAPI } from '../../api/CollectionStudentAttendanceAPI';
import { CollectionTuitionRecordAPI } from '../../api/CollectionTuitionRecordAPI';

const DIALOG_OPTION_ATTR = {
    IS_OPEN: 'isOpen',
    TITLE: 'title',
    MESSAGE: 'message',
    COMFIRM_ACTION: 'comfirmAction',
    SELECTED_CLASS: 'selectedClass'
}

const dialogInitObj = {
    [DIALOG_OPTION_ATTR.IS_OPEN]: false,
    [DIALOG_OPTION_ATTR.TITLE]: '',
    [DIALOG_OPTION_ATTR.MESSAGE]: '',
    [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: null,
    [DIALOG_OPTION_ATTR.SELECTED_CLASS]: null
}

export function ClassList({ refresh, setRefresh }) {

    const db_class = new CollectionClassAPI();
    const db_attendance = new CollectionAttendanceAPI();
    const db_studentAttendance = new CollectionStudentAttendanceAPI();
    const db_tuitionRecord = new CollectionTuitionRecordAPI();

    const [classlist, setClassList] = useState([]);
    const [isOpenMenu, setIsOpenMenu] = useState(null);
    const [dialogOption, setDialogOption] = useState(dialogInitObj);
    const [isOpenEditForm, setIsOpenEditForm] = useState(false);
    const [selectedEditClass, setSelectedEditClass] = useState(null);

    const getData = () => {
        db_class.getCollection().then((res) => { setClassList(res) })   // get all the class at the loading of the component
    }

    // useEffect(() => {
    //     getData();
    // }, [])

    useEffect(() => {
        getData();
    }, [refresh])

    const Item = styled(Paper)(({ theme }) => ({
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'left',
        color: theme.palette.text.secondary,
    }));

    const WeekDayItem = styled(Paper)(({ theme, bgcolor }) => ({
        marginRight: '5px',
        marginBottom: '5px',
        fontWeight: '700',
        fontSize: '0.8em',
        width: '37px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
        color: 'white',
        background: bgcolor
    }));

    const StudentItem = styled(Paper)(({ theme }) => ({
        marginBottom: '4px',
        marginRight: '4px',
        fontSize: '0.7em',
        padding: '4px 10px',
        textAlign: 'center',
        color: 'black',
        background: '#eee'
    }));


    const weekDayMapping = [
        { label: 'SUN', color: '#a36d6d' },
        { label: 'MON', color: '#a37a6d' },
        { label: 'TUE', color: '#a1a36d' },
        { label: 'WED', color: '#7fa36d' },
        { label: 'THU', color: '#6da382' },
        { label: 'FRI', color: '#6da3a0' },
        { label: 'SAT', color: '#a36d8b' },
    ]

    // Handler
    const handleToggleMenu = (selectedClass) => {
        if (isOpenMenu === selectedClass.key) {
            setIsOpenMenu(null)
            setDialogOption({ ...dialogOption, [DIALOG_OPTION_ATTR.SELECTED_CLASS]: null })
        } else {
            setIsOpenMenu(selectedClass.key)
            setDialogOption({ ...dialogOption, [DIALOG_OPTION_ATTR.SELECTED_CLASS]: selectedClass })
        }
    }

    const handleClickItem = (selectedClass) => {
        handleToggleMenu(selectedClass)
    }

    const [selectedClassDetail, setSelectedClassDetail] = useState(null)
    const handleMenuClickView = (selectedClass) => {
        setSelectedClassDetail(selectedClass);
    }

    const handleMenuClickEdit = (selectedClass) => {
        setSelectedEditClass(selectedClass)
        setIsOpenEditForm(true)
        setRefresh(!refresh)
    }

    const handleDeleteDetail = (selectedClass) => {
        console.log("ClassList: handleDeleteDetail: selectedClass: ",selectedClass)
        db_class.removeClass(selectedClass).then(() => {
            db_studentAttendance.deleteRecordsByClassKey(selectedClass.key).then(() => {
                db_attendance.deleteRecordsByClassKey(selectedClass.key).then(() => {
                    db_tuitionRecord.deleteRecordsByClassKey(selectedClass.key).then(() => {
                        setRefresh(!refresh)
                    })
                });
            });
        })
    }

    const handleMenuClickDelete = (selectedClass) => {
        setDialogOption({
            [DIALOG_OPTION_ATTR.IS_OPEN]: true,
            [DIALOG_OPTION_ATTR.MESSAGE]: 'After deleting the class, all the related attendance record will be deleted. ',
            [DIALOG_OPTION_ATTR.SELECTED_CLASS]: selectedClass,
            [DIALOG_OPTION_ATTR.COMFIRM_ACTION]: handleDeleteDetail,
            [DIALOG_OPTION_ATTR.TITLE]: `Are you sure to delete ${selectedClass.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]} ?`
        })
    }

    // Component a class description
    const ListClasses = () => classlist.map(item => (
        <Paper key={item.key} elevation={2} sx={{
            padding: '10px',
        }}>
            <Typography sx={{ fontSize: '1.3em', fontWeight: 700 }}>{item.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]}</Typography>

            <Grid container spacing={2} onClick={() => { handleClickItem(item) }} sx={{ paddingTop: '15px' }}>
                {/* Class Name/ Location/ Frequency */}
                <Grid item xs={6}>

                    <Box>
                        <Typography sx={{ ...commonStyle_vCenterImgText, fontSize: '1em' }}>
                            <LocationOnIcon /> {item.data[CLASS_FORM_ATTRIBUTES.LOCATION]}
                        </Typography>
                        <Typography sx={{ ...commonStyle_vCenterImgText, fontSize: '1em' }}>
                            <AccessTimeIcon /> {moment(item.data[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).format('HH:mm')}
                        </Typography>
                    </Box>

                    <Box sx={{ paddingTop: '8px' }}>
                        {/* Frequency */}
                        <Typography sx={{
                            fontSize: '1em',
                            marginBottom: '5px',
                            background: '#333',
                            color: 'white',
                            width: '100%',
                            maxWidth: '294px',
                            textAlign: 'center',
                            padding: '4px 0px 4px 0px'
                        }}>{item.data[CLASS_FORM_ATTRIBUTES.FREQUENCY].toUpperCase()}</Typography>

                        {/* weekday */}
                        <Stack direction='row' spacing={0} flexWrap={'wrap'}>
                            {
                                // sort and iterate the weekday
                                item.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].sort().map(weekday => (
                                    <WeekDayItem key={weekDayMapping[weekday].label} bgcolor={weekDayMapping[weekday].color}>{weekDayMapping[weekday].label}</WeekDayItem>
                                ))}
                        </Stack>
                    </Box>
                </Grid>

                {/* Students */}
                <Grid item xs={6}>
                    <Typography variant='subtitle1'>Students:</Typography>
                    <Stack direction='row' spacing={0} sx={{ flexWrap: 'wrap' }} >
                        {item.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].map(student => (
                            <StudentItem key={student[STUDENT_ATTRIBUTES.STUDENT_NAME]}>{student[STUDENT_ATTRIBUTES.STUDENT_NAME]}</StudentItem>
                        ))
                        }
                    </Stack>
                </Grid>
            </Grid>

            {/* Class Menu view/edit/delete */}
            <div style={{
                height: isOpenMenu === item.key ? 'auto' : '0',
                transform: isOpenMenu === item.key ? 'scaleY(1)' : 'scaleY(0)',
                opacity: isOpenMenu === item.key ? 1 : 0,
                marginTop: isOpenMenu === item.key ? '15px' : 0,
                paddingTop: isOpenMenu === item.key ? '15px' : 0,
                paddingBottom: isOpenMenu === item.key ? '5px' : 0,
                transformOrigin: '50% 0%',
                width: '100%',
                borderTop: '2px #ccc solid',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                transition: '0.4s',
            }}>
                <Button variant='contained' color="success" onClick={() => { handleMenuClickView(item) }}><PageviewIcon /></Button>
                <Button variant='contained' color='info' onClick={() => { handleMenuClickEdit(item) }} ><EditIcon /></Button>
                <Button variant='contained' color='error' onClick={() => { handleMenuClickDelete(item) }}><DeleteForeverIcon /></Button>

            </div>
        </Paper>
    ))



    return (
        <>
            {
                classlist !== undefined
                    // check is the class record empty
                    ? (classlist.length === 0
                        // If no class
                        ? (<div style={{
                            textAlign: 'center',
                            padding: '20px'
                        }}>There is no Class</div>)

                        // If the class record>1
                        : (
                            <>
                                {/* Class Detail Dialog */}
                                {selectedClassDetail ? (
                                    <ClassDetail selectedClass={selectedClassDetail} setSelectedClass={setSelectedClassDetail} />
                                ) : null}

                                {/* Class Edit Form Dialog */}
                                {isOpenEditForm && selectedEditClass ? (
                                    <ClassCreateForm isOpen={isOpenEditForm} setIsOpen={setIsOpenEditForm} selectedClass={selectedEditClass} setSelectedClass={setSelectedEditClass} refresh={refresh} setRefresh={setRefresh} />
                                ) : null}

                                <Box sx={{
                                    paddingTop: '15px',
                                    paddingBottom: '15px',
                                }}>
                                    <Stack spacing={2}>
                                        {/* List all Classes */}
                                        <ListClasses />
                                    </Stack>
                                </Box>

                                {/**
                                 *  Dialog for comfirmation of hide/delete class. 
                                 * */}
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
                                        <Button onClick={e => { dialogOption[DIALOG_OPTION_ATTR.COMFIRM_ACTION](dialogOption[DIALOG_OPTION_ATTR.SELECTED_CLASS]); setDialogOption(dialogInitObj) }} autoFocus>
                                            Confirm
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </>
                        ))
                    // If the class list is undefinded
                    : (
                        <Box sx={{ display: 'flex' }}>
                            <CircularProgress />
                        </Box>
                    )
            }
        </>
    );
}
