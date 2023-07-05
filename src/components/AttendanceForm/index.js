import { Alert, Button, Grid, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Paper, Snackbar, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, Switch, FormControlLabel, inputAdornmentClasses } from '@mui/material';
import { Box, fontWeight } from '@mui/system';
import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { CollectionAttendanceAPI, ATTENDANCE_STATE, ATTENDANCE_ATTRIBUTES } from '../../api/CollectionAttendanceAPI'
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES, TUITION_RECORD_STATE } from '../../api/CollectionTuitionRecordAPI';
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { CollectionStudentAttendanceAPI, STUDENT_ATTENDANCE_ATTR } from '../../api/CollectionStudentAttendanceAPI';
import { CollectionStudentAPI, STUDENT_ATTRIBUTES, STUDENT_STATE } from '../../api/CollectionStudentAPI'
import { SubpageHeader } from '../SubpageHeader';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import PaymentButton from '../PaymentButton';
import { TUITION_PAY_OPTION_ATTR } from '../TuitionPayForm';
import LoadingPage from '../LoadingPage'
import { asyncForEach } from '../../common/asyncForEach';
import { FREQUENCY } from '../../api/CollectionPreferenceAPI';


export function AttendanceForm({ attendancekey, setAttendanceKey }) {
    // API
    const db_student = new CollectionStudentAPI();
    const db_studentAttendance = new CollectionStudentAttendanceAPI();
    const db_attendance = new CollectionAttendanceAPI();
    const db_class = new CollectionClassAPI();
    const db_tuitionRecord = new CollectionTuitionRecordAPI();

    // STATE
    const [selectedAttendanceData, setSelectedAttendanceData] = useState(null);
    const [selectedClassData, setSelectedClassData] = useState(null);
    const [allTuitionRecord, setAllTuitionRecord] = useState([]);
    const [allStudentRecord, setAllStudentRecord] = useState([]);
    const [lessonRemainArray, setLessonRemainArray] = useState([]);
    const [studentAttendanceData, setStudentAttendanceData] = useState([]);

    const [lessonState, setLessonState] = useState(ATTENDANCE_STATE.NORMAL);
    const [openNoteIndex, setOpenNoteIndex] = useState(null)
    const [noteOfClassContent, setNoteOfClassContent] = useState('');

    const [isDisable, setIsDisable] = useState(false);
    const [refreshToggle, setRefreshToggle] = useState(true);
    const [refreshAttr, setRefreshAttr] = useState(false);

    const refresh = () => {
        setRefreshToggle(!refresh);
    }

    // The initialed version of student attendance
    const initStudentAttendance = {
        [STUDENT_ATTENDANCE_ATTR.STUDENT_KEY]: '',
        [STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY]: '',
        [STUDENT_ATTENDANCE_ATTR.STUDENT_NAME]: '',
        [STUDENT_ATTENDANCE_ATTR.CLASS_KEY]: '',
        [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: true,
        [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false,
        [STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION]: false,
        [STUDENT_ATTENDANCE_ATTR.NOTE]: '',
    }

    const initData = () => {
        setIsDisable(false);
        setOpenNoteIndex(null);
        setStudentAttendanceData([]);
        setLessonState(ATTENDANCE_STATE.NORMAL);
        setNoteOfClassContent('');
        setSelectedClassData(null)
        setSelectedAttendanceData(null)
        setAllTuitionRecord([])
    }

    const handleClose = () => {
        initData();
        setAttendanceKey(null);
    }

    useEffect(() => {
        if (attendancekey) {
            db_attendance.getDocument(attendancekey).then(attendanceDate => {
                db_class.getDocument(attendanceDate[ATTENDANCE_ATTRIBUTES.CLASS_KEY]).then(classData => {
                    db_tuitionRecord.getCollection().then(tuitionRecords => {
                        db_student.getCollection().then((res) => {
                            setAllStudentRecord(res)
                        })

                        setIsDisable(attendanceDate[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] !== ATTENDANCE_STATE.TICKET ? true : false)

                        // Save to state and reuse
                        setSelectedAttendanceData(attendanceDate)
                        setSelectedClassData(classData)
                        setAllTuitionRecord(tuitionRecords)

                        // Create the studentCard record
                        // If the attendance was taken.
                        if (attendanceDate[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] !== ATTENDANCE_STATE.TICKET) {
                            setLessonState(attendanceDate[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE]); // set the state from the old data.
                            db_studentAttendance.getCollection().then(allStudenAttendance => {
                                let recordHasThisAttendanceKey = allStudenAttendance.filter(rec => rec.data[STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY] === attendancekey);
                                let dataHasThisAttendanceKey = recordHasThisAttendanceKey.map(rec => rec.data);
                                setStudentAttendanceData(dataHasThisAttendanceKey);
                                setNoteOfClassContent(dataHasThisAttendanceKey[0][STUDENT_ATTENDANCE_ATTR.NOTE])
                            })
                        } else {
                            // create the initial studentAttendance 
                            let temp_studentAttendanceData = []
                            let temp_lessonRemainArr = [];

                            classData[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].forEach((student) => {

                                let lastestTuitionRecords = tuitionRecords.find(rec => rec.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === attendanceDate[ATTENDANCE_ATTRIBUTES.CLASS_KEY]
                                    && rec.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === student.key
                                    && rec.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                                    && (
                                        rec.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN] > 0
                                        || rec.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false
                                    )
                                )

                                if (!lastestTuitionRecords) {
                                    console.warn(`Warning: AttendanceForm: useEffect({},[]) : Can not find ${student[STUDENT_ATTRIBUTES.STUDENT_NAME]}'s remain lesson`)
                                } else {
                                    temp_lessonRemainArr.push(lastestTuitionRecords.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN])
                                }

                                temp_studentAttendanceData.push({
                                    ...initStudentAttendance,
                                    [STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY]: attendancekey,
                                    [STUDENT_ATTENDANCE_ATTR.STUDENT_KEY]: student.key,
                                    [STUDENT_ATTENDANCE_ATTR.STUDENT_NAME]: student[STUDENT_ATTRIBUTES.STUDENT_NAME],
                                    [STUDENT_ATTENDANCE_ATTR.CLASS_KEY]: attendanceDate[ATTENDANCE_ATTRIBUTES.CLASS_KEY],
                                })
                            })
                            setLessonRemainArray(temp_lessonRemainArr)
                            setStudentAttendanceData(temp_studentAttendanceData)
                        }
                    })
                })
            })
        }
    }, [attendancekey, refreshToggle])


    const TOGGLE_BUTTON_STATE = {
        PRESENT: 1,
        LATE: 2,
        ABSENT: 3,
    }

    const covertDataToState = (data) => {
        if (!data) return
        if (data[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] === true && data[STUDENT_ATTENDANCE_ATTR.IS_LATE] === false) {
            return 1
        } else if (data[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] === true && data[STUDENT_ATTENDANCE_ATTR.IS_LATE] === true) {
            return 2
        } else if (data[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] === false && data[STUDENT_ATTENDANCE_ATTR.IS_LATE] === false) {
            return 3
        }
    }

    const mapState = {
        [TOGGLE_BUTTON_STATE.PRESENT]: 'Present',
        [TOGGLE_BUTTON_STATE.LATE]: 'Late',
        [TOGGLE_BUTTON_STATE.ABSENT]: 'Absent',
    }

    const handleSwitchDeduction = (e, value, index) => {
        setStudentAttendanceData(studentAttendanceData
            .map((item, i) => i === index ? { ...item, [STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION]: value } : item))
    }

    const handleStudentAttendentState = (newValue, index) => {
        console.log('AttendaceForm : handleStudentAttendentState : newValue : ', newValue)

        if (!newValue) return;

        switch (newValue) {
            case TOGGLE_BUTTON_STATE.PRESENT:
                setStudentAttendanceData(studentAttendanceData.map((item, i) => i === index ? { ...item, [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: true, [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false } : item))
                return
            case TOGGLE_BUTTON_STATE.LATE:
                setStudentAttendanceData(studentAttendanceData.map((item, i) => i === index ? { ...item, [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: true, [STUDENT_ATTENDANCE_ATTR.IS_LATE]: true } : item))
                return
            case TOGGLE_BUTTON_STATE.ABSENT:
                setStudentAttendanceData(studentAttendanceData.map((item, i) => i === index ? { ...item, [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: false, [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false } : item))
                return
            default:
                console.error('ERROR : AttendanceForm : handleStudentAttendentState : invailed state selection')
                return;
        }
    }

    // A single student card shows the student name, toggle buttons of present/ late/ absent, and note button.
    const StudentCard = ({ index, studentData, notEditable, studentImage }) => {
        const [objForPaymentBtn, setObjForPaymentBtn] = useState({
            [TUITION_PAY_OPTION_ATTR.STUDENT_KEY]: ('key' in studentData) ? studentData.key : studentData[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY],
            [TUITION_PAY_OPTION_ATTR.STUDENT_NAME]: studentData[STUDENT_ATTRIBUTES.STUDENT_NAME],
            [TUITION_PAY_OPTION_ATTR.CLASS_KEY]: selectedAttendanceData[ATTENDANCE_ATTRIBUTES.CLASS_KEY]
        })

        let getValueOfState = (studentAttendanceData) => {
            if (!studentAttendanceData) {
                console.log('ERROR: AttendanceForm : getValueOfState : unavilable parameter', studentAttendanceData)
                return
            }
            if (studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] && studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_LATE]) {
                return TOGGLE_BUTTON_STATE.LATE
            } else if (studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] && !studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_LATE]) {
                return TOGGLE_BUTTON_STATE.PRESENT
            } else if (!studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] && !studentAttendanceData[STUDENT_ATTENDANCE_ATTR.IS_LATE]) {
                return TOGGLE_BUTTON_STATE.ABSENT
            } else {
                console.log('ERROR: AttendanceForm : getValueOfState : unavilable value')
            }
        }

        // Earse the note content of this student
        let handleClearNoteContent = (i) => {
            setStudentAttendanceData(studentAttendanceData.map((item, currentIndex) => currentIndex === i ? { ...item, [STUDENT_ATTENDANCE_ATTR.NOTE]: '' } : item))
        }

        let isThisNoteContentOpen = studentAttendanceData.length > 0 && (index !== undefined && index !== null) && studentAttendanceData[index][STUDENT_ATTENDANCE_ATTR.NOTE] && studentAttendanceData[index][STUDENT_ATTENDANCE_ATTR.NOTE] !== '' && !isDisable

        return (
            <Paper elevation={2}>
                <Box sx={{
                    padding: 2
                    , display: 'flex'
                    , justifyContent: 'space-between'
                    , alignItems: 'center'
                }}>
                    {/* Student Image */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '10px',
                        }}>
                            {studentImage ?
                                (
                                    <img src={studentImage}
                                        style={{
                                            height: '100%'
                                        }} />
                                ) : (
                                    <PersonIcon sx={{
                                        height: '50px',
                                        width: '50px'
                                    }} />
                                )
                            }
                        </div>
                        <Box>
                            <Typography>{studentData[STUDENT_ATTRIBUTES.STUDENT_NAME]} </Typography>
                            {isDisable ? null :
                                <>
                                    <Typography sx={{ fontSize: '0.7em', color: (lessonRemainArray[index] === 0 ? 'red' : '#333'), border: '#333 1px solid', width: '70px', paddingLeft: '2px', borderRadius: '5px' }} > Remaining lessons: {lessonRemainArray[index]} </Typography>
                                    {lessonRemainArray[index] === 0 ? (
                                        <PaymentButton studentKey={objForPaymentBtn[TUITION_PAY_OPTION_ATTR.STUDENT_KEY]} studentName={objForPaymentBtn[TUITION_PAY_OPTION_ATTR.STUDENT_NAME]} classKey={objForPaymentBtn[TUITION_PAY_OPTION_ATTR.CLASS_KEY]} isRefresh={refreshToggle} setIsRefresh={setRefreshToggle} parentRefresh={refreshAttr} setParentRefresh={setRefreshAttr}/>
                                    ) : null}

                                </>
                            }
                        </Box>
                    </Box>

                    <Box sx={{
                        display: 'flex'
                        , flexDirection: 'column'
                        , alignItems: 'flex-start'
                    }}>
                        <div
                            style={{
                                display: 'flex'
                                , alignItems: 'center'
                            }}
                        >
                            <ToggleButtonGroup
                                size='small'
                                defaultValue={TOGGLE_BUTTON_STATE.PRESENT}
                                value={lessonRemainArray[index]===0? TOGGLE_BUTTON_STATE.ABSENT :getValueOfState(studentAttendanceData[index])}
                                exclusive
                                onChange={(event, newValue) => handleStudentAttendentState(newValue, index)}
                                aria-label="student attendance state"
                            >
                                <ToggleButton disabled={notEditable || lessonRemainArray[index]===0} value={TOGGLE_BUTTON_STATE.PRESENT} aria-label="present" color="success">
                                    <CheckIcon />
                                </ToggleButton>
                                <ToggleButton disabled={notEditable ||  lessonRemainArray[index]===0} value={TOGGLE_BUTTON_STATE.LATE} aria-label="late" color="warning">
                                    <WatchLaterIcon />
                                </ToggleButton>
                                <ToggleButton disabled={notEditable || lessonRemainArray[index]===0} value={TOGGLE_BUTTON_STATE.ABSENT} aria-label="absent" color="error">
                                    <CloseIcon />
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <IconButton disabled={notEditable} aria-label="add note" onClick={() => setOpenNoteIndex(index)}>
                                <NoteAltIcon />
                            </IconButton>
                        </div>

                        <Typography sx={{ fontSize: '0.7em', fontWeight: '600', color: '#888' }}>
                            Selected state: {mapState[covertDataToState(studentAttendanceData[index])]}
                        </Typography>

                        {covertDataToState(studentAttendanceData[index]) === 3 ?
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #aaa', borderRadius: '5px', width: '150px' }}>
                                <Switch color='warning'
                                    disabled={isDisable || lessonRemainArray[index]===0}
                                    checked={studentAttendanceData[index][STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION]}
                                    onChange={(e, newValue) => handleSwitchDeduction(e, newValue, index)}
                                />
                                <Typography sx={{
                                    fontSize: '0.8em',
                                    paddingRight: '10px',
                                    fontWeight: '500'
                                }}>Deduct from remainder</Typography>
                            </div>
                            : null
                        }


                    </Box>
                </Box>

                {isThisNoteContentOpen ? (
                    // The note content section of the Student
                    <Grid container sx={{ background: '#F2ECDB' }}>
                        <Grid item xs={9}>
                            <Box sx={{ padding: '15px', borderTop: '2px #f2f2f2 solid' }}>
                                <Typography sx={{ fontWeight: 600, paddingBottom: '5px' }}>Note:</Typography>
                                {studentAttendanceData[index][STUDENT_ATTENDANCE_ATTR.NOTE]}
                            </Box>
                        </Grid>
                        <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
                            <Button onClick={() => handleClearNoteContent(index)} sx={{ width: '30px', height: '40px', border: "2px solid #CCC", borderRadius: "50px" }}>
                                <DeleteForeverIcon color='error' />
                            </Button>
                        </Grid>
                    </Grid>
                ) : null}
            </Paper>
        )
    }

    const AllAttendedBtn = () => {
        let checkAllStudent = () => {
            setStudentAttendanceData(studentAttendanceData.map(item => ({ ...item, [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: true, [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false })))
        }

        return (
            <div style={{ width: '100%', textAlign: 'right', marginTop: 10, marginBottom: 10 }}>
                <Button disabled={lessonState !== ATTENDANCE_STATE.NORMAL || isDisable} variant='outlined' onClick={checkAllStudent}>
                    Set all attended
                </Button>
            </div>
        )
    }

    const handleClearNoteOfClassContent = () => {
        setNoteOfClassContent('');
    }


    const [isLoading, setIsLoading] = useState(false)    // for the loading page

    const handleSubmit = () => {
        setIsLoading(true)
        let isPostponedOrVoid = (lessonState === ATTENDANCE_STATE.POSTPONED || lessonState === ATTENDANCE_STATE.VOID)
        let studentAttendanceDataForSubmit = studentAttendanceData
        // let subtractAmountOfLesson = (lessonState === ATTENDANCE_STATE.NORMAL || lessonState === ATTENDANCE_STATE.VOID) ? 1 : 0;
        let subtractAmountOfLesson = 1;

        if (isPostponedOrVoid) {
            let stateStr = (lessonState === ATTENDANCE_STATE.POSTPONED) ? 'POSTPONED' : 'VOID'
            studentAttendanceDataForSubmit = studentAttendanceData.map(item => ({ ...item, [STUDENT_ATTENDANCE_ATTR.NOTE]: `${stateStr} - ${noteOfClassContent}` }))
        }

        return asyncForEach(studentAttendanceDataForSubmit, (studentAttendance) =>
            db_studentAttendance.addDocument(studentAttendance).then( res => {
                if (!res) console.log('Create student Attendance record fail.')
                // subtract the remain lesson on the tuition record.
                if (studentAttendance[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] === true || studentAttendance[STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION] === true) {
                    return db_tuitionRecord.updateRemainLessonSubtraction(studentAttendance[STUDENT_ATTENDANCE_ATTR.CLASS_KEY], studentAttendance[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY], subtractAmountOfLesson)
                }
            })
        ).then(() => {
            if (!selectedClassData[CLASS_FORM_ATTRIBUTES.LAST_DATE] && selectedClassData[CLASS_FORM_ATTRIBUTES.FREQUENCY] !== FREQUENCY.ONCE) {
                db_attendance.createTicketFromLast({
                    key: selectedAttendanceData[ATTENDANCE_ATTRIBUTES.CLASS_KEY],
                    data: selectedClassData
                })
            }

            // update the last modified date
            return db_attendance.updateDocument(attendancekey, { [ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE]: lessonState, [ATTENDANCE_ATTRIBUTES.LAST_MODIFY_DATE]: new Date(), [ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT]: false })
                .then(() => {
                    setSnackBarMsg('Attendance completed.')
                    setIsSubmitted(true);
                    setIsLoading(false)
                    handleClose();
                })
        })


        // studentAttendanceDataForSubmit.forEach((studentAttendance) => {
        //     // add the record to database.
        //     db_studentAttendance.addDocument(studentAttendance).then( res => {
        //         if (!res) console.log('Create student Attendance record fail.')
        //         // subtract the remain lesson on the tuition record.
        //         if (studentAttendance[STUDENT_ATTENDANCE_ATTR.IS_PRESENT] === true) {
        //             console.log()
        //             db_tuitionRecord.updateRemainLessonSubtraction(studentAttendance[STUDENT_ATTENDANCE_ATTR.CLASS_KEY], studentAttendance[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY], subtractAmountOfLesson)
        //         }
        //     })
        // })


    }



    const handleChangeLessonState = (e, newValue) => {
        if (!newValue) return
        setLessonState(newValue)

        switch (newValue) {
            case ATTENDANCE_STATE.NORMAL:
                setStudentAttendanceData(studentAttendanceData.map(item => ({ ...item, [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: true, [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false })))
                return;

            case ATTENDANCE_STATE.POSTPONED:
                setStudentAttendanceData(studentAttendanceData.map(item => ({
                    ...item,
                    [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: false,
                    [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false,
                    [STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION]: false
                })))
                return

            case ATTENDANCE_STATE.VOID:
                setStudentAttendanceData(studentAttendanceData.map((item,index) => ({
                    ...item,
                    [STUDENT_ATTENDANCE_ATTR.IS_PRESENT]: false,
                    [STUDENT_ATTENDANCE_ATTR.IS_LATE]: false,
                    [STUDENT_ATTENDANCE_ATTR.LESSON_DEDUCTION]: lessonRemainArray[index]===0 ? false : true
                })))
                return

            default:
                console.error('ERROR : AttendanceForm : handleChangeLessonState: invailed state')
                return

        }
    }

    // The note window
    const NoteWindow = () => {

        let [noteContent, setNoteContent] = useState(studentAttendanceData && (openNoteIndex !== undefined && openNoteIndex !== null) ? studentAttendanceData[openNoteIndex][STUDENT_ATTENDANCE_ATTR.NOTE] : '')

        let handleCloseNoteBox = () => {
            setOpenNoteIndex(null)
        }

        let handleComfirmContent = () => {
            setStudentAttendanceData(studentAttendanceData.map((item, index) => index === openNoteIndex ? { ...item, [STUDENT_ATTENDANCE_ATTR.NOTE]: noteContent } : item))
            setOpenNoteIndex(null)
            //  TODO: REFRESH AFTER MODIFICATION
        }

        let StudentName = selectedClassData && (openNoteIndex !== undefined && openNoteIndex !== null) ? selectedClassData[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT][openNoteIndex][STUDENT_ATTRIBUTES.STUDENT_NAME] : null;

        return (
            <>
                <Dialog
                    open={(openNoteIndex !== undefined && openNoteIndex !== null) ? true : false}
                    onClose={handleCloseNoteBox}
                    aria-labelledby={`add-note-title`}
                    aria-describedby={`add-note-description`}
                >
                    <DialogTitle id={`add-note-title`}>
                        Add note to {StudentName}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{
                            paddingTop: '10px',
                            paddingBottom: '10px'
                        }}>
                            <TextField
                                fullWidth
                                id="add-note-content"
                                label="Message"
                                multiline
                                rows={10}
                                onChange={(e) => { setNoteContent(e.target.value) }}
                                value={noteContent}
                                variant="outlined"
                            />
                        </Box>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseNoteBox}>Cancel</Button>
                        <Button variant='contained' onClick={handleComfirmContent} autoFocus>
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        )
    }

    // Snackbar shows the message.
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [snackBarMsg, setSnackBarMsg] = useState('');
    const SubmittedSnackbar = () => {
        return (
            <>
                {/* The alert that after create a student record */}
                <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={isSubmitted} autoHideDuration={5000} onClose={() => setIsSubmitted(false)}>
                    <Alert onClose={() => setIsSubmitted(false)} severity="success" sx={{ width: '100%' }}>
                        {snackBarMsg}
                    </Alert>
                </Snackbar>
            </>
        )
    }

    return (
        <>
            {/* For the message after submittion */}
            <SubmittedSnackbar />

            <Dialog
                fullScreen
                open={attendancekey ? true : false}
            >
                <NoteWindow />

                {isLoading
                    ? (<LoadingPage title={'Submiting Data'} description={'Please Wait a moment'} />)
                    : (
                        <>
                            {attendancekey && selectedAttendanceData && selectedClassData ?
                                <>
                                    <SubpageHeader bgColor="yellow" title="Attendance Record" onclose={handleClose} textColor="#333" />
                                    <Container>
                                        {isDisable ?
                                            <Typography sx={{ color: "#888", fontSize: "0.8em", paddingTop: '5px' }}>Last modification at {moment(selectedAttendanceData[ATTENDANCE_ATTRIBUTES.LAST_MODIFY_DATE]).format('DD/MM/YY')}</Typography>
                                            : null
                                        }
                                        {/* ------------------Class & attendance information----------------- */}
                                        <Grid container sx={{ borderBottom: '2px #eee solid', paddingTop: '10px', paddingBottom: '10px', marginTop: '10px' }}>

                                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '1.2em' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '1.2em', fontWeight: '700' }}>{selectedClassData ? selectedClassData[CLASS_FORM_ATTRIBUTES.CLASS_NAME] : 'DELETED CLASS'} </Typography>
                                                    <Typography sx={{ color: "#888" }}>{moment(selectedAttendanceData[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]).format('DD/MM/YY')}</Typography>
                                                    <Typography sx={{ color: "#888" }}>{moment(selectedAttendanceData[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]).format('HH:mm')} - {moment(selectedAttendanceData[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]).format('HH:mm')}</Typography>
                                                    <Typography sx={{ color: "#888" }}>{selectedClassData ? selectedClassData[CLASS_FORM_ATTRIBUTES.LOCATION] : 'DELETED CLASS INFORMATION'}</Typography>
                                                </Box>
                                            </Grid>

                                            {/* ------------------Class State Selection----------------- */}
                                            <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} >
                                                <Box>
                                                    <ToggleButtonGroup
                                                        disabled={isDisable} // disable the change in view mode
                                                        orientation="vertical"
                                                        value={lessonState}
                                                        exclusive
                                                        onChange={handleChangeLessonState}
                                                    >
                                                        <ToggleButton color='success' value={ATTENDANCE_STATE.NORMAL} aria-label="normal">
                                                            NORMAL
                                                        </ToggleButton>
                                                        <ToggleButton color='warning' value={ATTENDANCE_STATE.POSTPONED} aria-label="postpone lesson">
                                                            POSTPONED
                                                        </ToggleButton>
                                                        <ToggleButton color='error' value={ATTENDANCE_STATE.VOID} aria-label="void lesson">
                                                            VOID
                                                        </ToggleButton>
                                                    </ToggleButtonGroup>
                                                </Box>
                                            </Grid>

                                            {/* The class note only appear when the state is postponed and void for the reasoning */}
                                            {
                                                lessonState !== ATTENDANCE_STATE.NORMAL ? // only show this section while lessonState is postpone and void
                                                    <>
                                                        <Grid container sx={{ paddingTop: '25px' }}>
                                                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                <TextField
                                                                    fullWidth
                                                                    disabled={isDisable} // disable the change in view mode
                                                                    id="class-note-content"
                                                                    label="Reason"
                                                                    multiline
                                                                    rows={4}
                                                                    onChange={(e) => setNoteOfClassContent(e.target.value)}
                                                                    value={noteOfClassContent}
                                                                    variant="outlined"
                                                                />
                                                            </Grid>

                                                            {isDisable ? null :
                                                                // In the view model, user is not allow to change the Reason
                                                                <Grid item xs={12} sx={{ textAlign: 'right', paddingRight: '3px' }}>
                                                                    <Button onClick={() => handleClearNoteOfClassContent()}
                                                                        sx={{
                                                                            padding: '5px'
                                                                            , borderBottom: "1px solid #CCC"
                                                                            , borderLeft: "1px solid #CCC"
                                                                            , borderRight: "1px solid #CCC"
                                                                            , borderRadius: "0px 0px 5px 5px"
                                                                        }}>
                                                                        <DeleteForeverIcon color='error' />
                                                                    </Button>
                                                                </Grid>}

                                                        </Grid>
                                                    </>
                                                    : null
                                            }

                                        </Grid>

                                        <AllAttendedBtn />

                                        {/*---------------- List Student Card ----------------*/}
                                        <Stack spacing={1}>
                                            {isDisable
                                                ? studentAttendanceData.map((student, index) => <StudentCard key={index} index={index} studentData={student} notEditable={isDisable} studentImage={allStudentRecord.length > 0 ? allStudentRecord.find(rec => rec.key === student[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY]).data[STUDENT_ATTRIBUTES.IMAGE_URI] : null} />)
                                                : selectedClassData[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].map((studentInClass, index) => {
                                                    return <StudentCard key={index} index={index} studentData={studentInClass} isDisable={isDisable} studentImage={allStudentRecord.length > 0 ? allStudentRecord.find(rec => rec.key === studentInClass.key).data[STUDENT_ATTRIBUTES.IMAGE_URI] : null} />
                                                })
                                            }
                                        </Stack>


                                        {isDisable ? null :
                                            <Box sx={{ paddingTop: '30px', paddingBottom: '30px' }}>
                                                <Button size='large' variant='contained' sx={{
                                                    width: '100%',
                                                    borderRadius: '50px'
                                                }} onClick={handleSubmit}>Submit</Button>
                                            </Box>}


                                    </Container>
                                </>
                                : <LoadingPage title={'Loading attendance data'} description={'Please wait a moment.'} />}
                        </>
                    )}

            </Dialog>

        </>
    )
}
