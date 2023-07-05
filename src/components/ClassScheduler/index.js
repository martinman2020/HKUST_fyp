import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import {
    EditingState,
    IntegratedEditing,
    ViewState,
} from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    WeekView,
    DayView,
    Appointments,
    Toolbar,
    DateNavigator,
    ViewSwitcher,
    AppointmentForm,
    AppointmentTooltip,
    TodayButton,
    MonthView,
    DragDropProvider,
    ConfirmationDialog,
} from '@devexpress/dx-react-scheduler-material-ui';
import { ATTENDANCE_ATTRIBUTES, ATTENDANCE_STATE, CollectionAttendanceAPI } from '../../api/CollectionAttendanceAPI';
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { CollectionPreferenceAPI, FREQUENCY, PREFERENCE_ATTRIBUTES, presetPreference } from '../../api/CollectionPreferenceAPI';
import { CollectionStudentAttendanceAPI, STUDENT_ATTENDANCE_ATTR } from '../../api/CollectionStudentAttendanceAPI';

import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import LoadingPage from '../LoadingPage';
import { STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI';
import { AttendanceForm } from '../../components/AttendanceForm'
import moment from 'moment';
import SnackBars, { initSnackBarsOption } from '../SnackBars';
import { asyncForEach } from '../../common/asyncForEach';

const PREFIX = 'classScheduler';

const classes = {
    toolbarRoot: `${PREFIX}-toolbarRoot`,
    progress: `${PREFIX}-progress`,
};

const StyledDiv = styled('div')({
    [`&.${classes.toolbarRoot}`]: {
        position: 'relative',
    },
});

const StyledLinearProgress = styled(LinearProgress)(() => ({
    [`&.${classes.progress}`]: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        left: 0,
    },
}));

const db_attendance = new CollectionAttendanceAPI();
const db_class = new CollectionClassAPI();
const db_preference = new CollectionPreferenceAPI();
const db_studentAttendance = new CollectionStudentAttendanceAPI();


const ToolbarWithLoading = (
    ({ children, ...restProps }) => (
        <StyledDiv className={classes.toolbarRoot}>
            <Toolbar.Root {...restProps}>
                {children}
            </Toolbar.Root>
            <StyledLinearProgress className={classes.progress} />
        </StyledDiv>
    )
);

const mapAppointmentData = appointment => ({
    id: appointment.id,
    startDate: appointment.start,
    endDate: appointment.end,
    title: appointment.title,
    attendanceType: appointment.attendanceType,
    students: appointment.students,
});

const reducer = (state, action) => {
    switch (action.type) {
        case 'setLoading':
            return { ...state, loading: action.payload };
        case 'setData':
            return { ...state, data: action.payload.map(mapAppointmentData) };
        case 'setCurrentViewName':
            return { ...state, currentViewName: action.payload };
        case 'setCurrentDate':
            return { ...state, currentDate: action.payload };
        default:
            return state;
    }
};

const BooleanEditor = props => {
    return <AppointmentForm.BooleanEditor {...props} readOnly style={{ display: 'none' }} />;
};


// =============================================================
// ================== Appointment customization START ===================
// =============================================================

const mappingAppointmentBackgroundColor = {
    [ATTENDANCE_STATE.NORMAL]: '#56ba66',
    [ATTENDANCE_STATE.POSTPONED]: '#d1c356',
    [ATTENDANCE_STATE.VOID]: '#ffa884',
    [ATTENDANCE_STATE.TICKET]: '#4c8bba',
}

const Appointment = (({ ...restProps }) => (
    <StyledAppointmentsAppointment
        {...restProps}
        className={'appointment'}
    />
));

const DraftAppointment = ({
    children, style, ...restProps
}) => {
    let attendanceState = restProps.data.attendanceType
    let backgroundColor = mappingAppointmentBackgroundColor[attendanceState]
    return (
        <DragDropProvider.DraftAppointment {...restProps} style={{ ...style, background: backgroundColor }} />
    )
}

const SourceAppointment = ({ children, style, ...restProps }) => {
    let attendanceState = restProps.data.attendanceType
    let backgroundColor = mappingAppointmentBackgroundColor[attendanceState]
    return (
        <DragDropProvider.SourceAppointment {...restProps} style={{ ...style, background: backgroundColor }} />
    )
}

const StyledAppointmentsAppointment = styled(Appointments.Appointment)((...restProps) => {
    let attendanceState = restProps[0].data.attendanceType
    let backgroundColor = mappingAppointmentBackgroundColor[attendanceState]
    return ({
        [`&.appointment`]: {
            borderRadius: '5px',
            background: `${backgroundColor}`,
            '&:hover': {
                background: `${backgroundColor}`,
                opacity: 0.6,
            },
        },
    })
});

const StyledAppointmentsAppointmentContent = styled(Appointments.AppointmentContent)(() => ({
    ['&.appointmentContent']: {
        '&>div>div': {
            whiteSpace: 'normal !important',
            lineHeight: 1.2,
        },
    },
}));

const AppointmentContent = (({ ...restProps }) => (
    <StyledAppointmentsAppointmentContent {...restProps} className={'appointmentContent'} />
));

const MonthViewDayScaleCell = props => (
    <MonthView.DayScaleCell {...props} style={{ textAlign: 'center', fontWeight: 'bold' }} />
);




// =============================================================
// ================== Appointment customization END ===================
// =============================================================

export const ClassScheduler = ({ refresh, setRefresh }) => {

    const initialState = {
        data: [],
        loading: false,
        currentDate: new Date(),
        currentViewName: 'Week', // TODO: NEED TO MODIFY to preference variable
    };

    const [state, dispatch] = React.useReducer(reducer, initialState);
    const {
        data, loading, currentViewName, currentDate,
    } = state;
    const setCurrentViewName = React.useCallback(nextViewName => dispatch({
        type: 'setCurrentViewName', payload: nextViewName,
    }), [dispatch]);
    const setData = React.useCallback(nextData => dispatch({
        type: 'setData', payload: nextData,
    }), [dispatch]);
    const setCurrentDate = React.useCallback(nextDate => dispatch({
        type: 'setCurrentDate', payload: nextDate,
    }), [dispatch]);
    const setLoading = React.useCallback(nextLoading => dispatch({
        type: 'setLoading', payload: nextLoading,
    }), [dispatch]);



    const [allClassRecord, setAllClassRecord] = React.useState(null);
    const [allAttendanceRecord, setAllAttendanceRecord] = useState(null);
    const [allStudentAttendance, setAllStudentAttendace] = useState(null);

    const [preference, setPreference] = React.useState(null)
    const [selectedAttendanceKey, setSelectedAttendanceKey] = useState(null)
    const [selectedAttendanceState, setSelecetedAttendanceState] = useState(null)

    const [snackBarOption, setSnackBarOption] = useState(initSnackBarsOption);

    React.useEffect(() => {
        db_class.getCollection().then(rec => setAllClassRecord(rec))
        // If a attribute in preference cannot find in record, add it as a new attribute
        db_preference.getPreference().then(rec => {
            let needToUpdate = {};
            for (let attrAlias in PREFERENCE_ATTRIBUTES) {
                let attr = PREFERENCE_ATTRIBUTES[attrAlias]
                if (!(attr in rec)) {
                    needToUpdate = { ...needToUpdate, [attr]: presetPreference[attr] }
                }
            }
            if (Object.keys(needToUpdate).length > 0) {
                db_preference.setAttributeByObject(needToUpdate);
                setPreference({ ...rec, ...needToUpdate })
            } else {
                setPreference(rec)
                setCurrentViewName(rec[PREFERENCE_ATTRIBUTES.DEFAULT_SCHEDULER_VIEW])
            }
        });
    }, [])

    

    // =============================================================
    // ================== Tip Tool Content START ===================
    // =============================================================
    const getStudentNamesPromise = (attendanceRecord) => {
        let attendancekey = attendanceRecord.key
        let attendanceData = attendanceRecord.data

        // console.log('attendanceData', attendanceData)

        if (!attendanceRecord) { console.error('Error: ClassScheduler: displayStudentsInTipToolContent: missing attendance record'); return; }

        if (attendanceData[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] === ATTENDANCE_STATE.TICKET) {
            // console.log('This is a ticket')
            return db_class.getDocument(attendanceData[ATTENDANCE_ATTRIBUTES.CLASS_KEY]).then(classData => {
                // console.log('classData', classData)
                return classData[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].map(studentData => studentData[STUDENT_ATTRIBUTES.STUDENT_NAME])
            })
        } else {
            // console.log('This is not a ticket')
            return db_studentAttendance.getCollection().then(_studentAttendanceData => {
                // console.log('_studentAttendanceData', _studentAttendanceData)
                return _studentAttendanceData.filter(record => record.data[STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY] === attendancekey).map(item => item.data[STUDENT_ATTENDANCE_ATTR.STUDENT_NAME])
            })
        }
    }

    const ListNameTag = ({ studentNameList }) => {
        return (
            <Stack direction="row" spacing={0} flexWrap={'wrap'}>
                {studentNameList.map(name => <Chip sx={{ marginBottom: '5px', marginLeft: '5px' }} variant='outlined' key={name} label={name} />)}
            </Stack >
        )
    }

    const StateChips = ({ state }) => {
        let stateChipsMapping = {
            [ATTENDANCE_STATE.TICKET]: { label: 'ticket', color: 'black', background: '#c5cae9' },
            [ATTENDANCE_STATE.NORMAL]: { label: 'normal', color: 'black', background: '#dcedc8' },
            [ATTENDANCE_STATE.POSTPONED]: { label: 'postponed', color: 'black', background: '#ffecb3' },
            [ATTENDANCE_STATE.VOID]: { label: 'void', color: 'black', background: '#d7ccc8' },
        }

        let selectedObj = stateChipsMapping[state];

        return (
            <>
                <Chip
                    variant='filled'
                    label={state.toUpperCase()}
                    sx={{ color: selectedObj.color, background: selectedObj.background, fontWeight: '700' }}
                />
            </>
        )
    }

    const TipToolContent = (({
        children, appointmentData, ...restProps
    }) => {
        const [studentNameList, setStudentNameList] = useState([])
        const attendanceRec = allAttendanceRecord.find(rec => rec.key === appointmentData.id)

        React.useEffect(() => {
            if (attendanceRec) {
                getStudentNamesPromise(attendanceRec).then(res => { setStudentNameList(res) })
            }
        }, [])

        return (
            <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
                <Grid container>
                    {attendanceRec ? (
                        <>
                            <Grid item xs={12}>
                                <StateChips state={attendanceRec.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE]} />
                            </Grid>
                        </>
                    ) : null}

                    <Grid item xs={12}
                        sx={{ border: '2px solid #eee', borderRadius: '5px', padding: '10px', marginTop: '5px', marginBottom: '5px' }}
                    >
                        <Typography sx={{ paddingBottom: '10px' }}>Students:</Typography>

                        <ListNameTag studentNameList={studentNameList} />
                    </Grid>

                    <Grid item xs={12}>
                        <Button variant='contained' color='primary' onClick={() => { setSelectedAttendanceKey(appointmentData.id); }} >
                            {selectedAttendanceState !== ATTENDANCE_STATE.TICKET ? 'View Attendance' : 'Take Attendance'}
                        </Button>
                    </Grid>
                </Grid>
            </AppointmentTooltip.Content>
        )
    });

    // =============================================================
    // ================== Tip Tool Content END =====================
    // =============================================================



    const getData = (setData, setLoading) => {
        setLoading(true);
        let appointment = []
        db_studentAttendance.getCollection()
            .then(_allStudentAttendanceRecords => setAllStudentAttendace(_allStudentAttendanceRecords))

        return db_attendance.getCollection().then(_allAttendanceRecords => {
            return db_class.getCollection().then(_allClassRecords => {
                if (!Array.isArray(_allClassRecords)) _allClassRecords = [_allClassRecords];

                setAllAttendanceRecord(_allAttendanceRecords)
                setAllClassRecord(_allClassRecords)

                asyncForEach(_allAttendanceRecords, (_attendanceRecord) => {
                    let selectedClass = _allClassRecords.find(classReocrd => classReocrd.key === _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY])
                    if (selectedClass) {
                        appointment.push({
                            id: _attendanceRecord.key,
                            title: selectedClass.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME],
                            start: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME],
                            end: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME],
                            attendanceType: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE],
                        })
                    }
                }).then(() => {
                    setData(appointment)
                    setLoading(false);
                })

                // _allAttendanceRecords.forEach(_attendanceRecord => {
                //     let selectedClass = _allClassRecords.find(classReocrd => classReocrd.key === _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY])
                //     if (selectedClass) {
                //         appointment.push({
                //             id: _attendanceRecord.key,
                //             title: selectedClass.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME],
                //             start: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME],
                //             end: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME],
                //             attendanceType: _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE],
                //         })
                //     }
                // })

            })
            // .then(() => {
            //     setData(appointment)
            //     setLoading(false);
            // })
        })

    };

    React.useEffect(() => {
        getData(setData, setLoading);
    }, [setData, currentViewName, currentDate, refresh, selectedAttendanceKey]);

    useEffect(() => {

    }, [])

    const handleAppointmentChange = ({ added, changed, deleted }) => {
        if (added) {
            console.log(added)
        }
        if (changed) {
            let attendanceKey = Object.keys(changed)[0]
            let startDateTime = changed[attendanceKey].startDate
            let endDateTime = changed[attendanceKey].endDate

            // if the attendance is not ticket, then not allow to change the time.
            let selectedAttendanceRecord = allAttendanceRecord.find(_attendanceRecord => _attendanceRecord.key === attendanceKey)
            let classKey = selectedAttendanceRecord.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY]
            if (selectedAttendanceRecord.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] !== ATTENDANCE_STATE.TICKET) {
                setSnackBarOption({ isShow: true, message: "Finished attendance cannot be modified.", type: 'warning' })    // show the warning snackbar. 
                return { data }
            }

            db_class.getDocument(classKey).then(classData => {
                // handle the month view modification, as there is no time range while modifing on month view,
                // the time is set to 00:00
                if (moment(changed[attendanceKey].startDate).format('HHmm') === '0000') {
                    db_attendance.getDocument(attendanceKey).then(res => {
                        let currentStartHour = moment(res[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]).get('hour')
                        let currentStartminute = moment(res[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]).get('minute')
                        let currentEndHour = moment(res[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]).get('hour')
                        let currentEndminute = moment(res[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]).get('minute')

                        startDateTime = moment(startDateTime).set({ 'hour': currentStartHour, 'minute': currentStartminute })
                        endDateTime = moment(startDateTime).set({ 'hour': currentEndHour, 'minute': currentEndminute, 'date': startDateTime.get(`date`) })

                        if (classData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.ONCE) {
                            db_class.updateDocument(classKey, {
                                [CLASS_FORM_ATTRIBUTES.START_DATE]: new Date(moment(startDateTime).set({ 'hour': 0, 'minute': 0 })),
                                [CLASS_FORM_ATTRIBUTES.LAST_DATE]: new Date(moment(endDateTime).set({ 'hour': 23, 'minute': 59 })),
                                [CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]: new Date(startDateTime)
                            })
                        }

                        db_attendance.updateDocument(attendanceKey, {
                            [ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT]: false,
                            [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(startDateTime),
                            [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(endDateTime),
                        }).then(() => setRefresh(!refresh))
                    })
                } else {
                    if (classData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.ONCE) {
                        db_class.updateDocument(classKey, {
                            [CLASS_FORM_ATTRIBUTES.START_DATE]: new Date(moment(startDateTime).set({ 'hour': 0, 'minute': 0 })),
                            [CLASS_FORM_ATTRIBUTES.LAST_DATE]: new Date(moment(endDateTime).set({ 'hour': 23, 'minute': 59 })),
                            [CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]: new Date(startDateTime)
                        })
                    }

                    db_attendance.updateDocument(attendanceKey, {
                        [ATTENDANCE_ATTRIBUTES.IS_BY_DEFAULT]: false,
                        [ATTENDANCE_ATTRIBUTES.START_DATE_TIME]: new Date(startDateTime),
                        [ATTENDANCE_ATTRIBUTES.END_DATE_TIME]: new Date(endDateTime),
                    }).then(() => setRefresh(!refresh))
                }

                setSnackBarOption({ isShow: true, message: "Appointment modified successfully", type: 'success' })

                // db_attendance.updateDocument(attendanceKey)
                console.log('attendanceKey:', attendanceKey)
                console.log('startDateTime:', startDateTime)
                console.log('endDateTime:', endDateTime)
            })

        }
        if (deleted !== undefined) {
            let attendanceKey = deleted
            // Remove the attendance record.
            db_attendance.getDocument(attendanceKey).then((res) => {
                db_class.getDocument(res[ATTENDANCE_ATTRIBUTES.CLASS_KEY]).then(classData => {
                    if (classData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.ONCE) {
                        setSnackBarOption({ isShow: true, message: "Please delete the one time class instead of delete the appointment ", type: 'error' })
                    } else {
                        db_attendance.deleteDocument(attendanceKey).then(() => {
                            // Remove the related student attendance
                            db_studentAttendance.getCollection().then(_allStudentAttendance => {
                                let filteredTargetStudentAttendance = _allStudentAttendance.filter((studentAttendance) => studentAttendance.data[STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY] === attendanceKey)

                                asyncForEach(filteredTargetStudentAttendance, record => {
                                    db_studentAttendance.deleteDocument(record.key)
                                }).then(() => {
                                    setRefresh(!refresh)
                                    setSnackBarOption({ isShow: true, message: "Appointment deleted successfully", type: 'success' })
                                })

                            })
                        })
                    }
                })
            })

        }
        return { data };
    }

    const handleCloseSnackBars = () => {
        setSnackBarOption({ ...snackBarOption, isShow: false })
    }

    return (
        <>
            <AttendanceForm attendancekey={selectedAttendanceKey} setAttendanceKey={setSelectedAttendanceKey} />
            <SnackBars {...snackBarOption} onClose={handleCloseSnackBars} />

            <Paper>
                {/* <Button onClick={() => setSnackBarOption({ isShow: true, message: 'Testing', type: 'success' })} >Snackbar test</Button> */}
                {preference ?
                    <Scheduler
                        data={data}
                        height={660}
                    >
                        <ViewState
                            currentDate={currentDate}
                            currentViewName={currentViewName}
                            onCurrentViewNameChange={setCurrentViewName}
                            onCurrentDateChange={setCurrentDate}
                        />
                        <DayView
                            startDayHour={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]}
                            endDayHour={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]}
                        />
                        <WeekView
                            startDayHour={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]}
                            endDayHour={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]}
                        />
                        <MonthView
                            dayScaleCellComponent={MonthViewDayScaleCell}
                        />
                        <Appointments
                            appointmentComponent={Appointment}
                            appointmentContentComponent={AppointmentContent}
                        />
                        <Toolbar
                            {...loading ? { rootComponent: ToolbarWithLoading } : null}
                        />
                        <DateNavigator />
                        <TodayButton />
                        <ViewSwitcher />
                        <EditingState onCommitChanges={handleAppointmentChange} />
                        <IntegratedEditing />
                        <ConfirmationDialog />
                        <AppointmentTooltip
                            contentComponent={TipToolContent}
                            showDeleteButton
                            showOpenButton
                            showCloseButton
                        />
                        <DragDropProvider
                            draftAppointmentComponent={DraftAppointment}
                            sourceAppointmentComponent={SourceAppointment}
                            allowResize={() => false}
                        />

                        <AppointmentForm booleanEditorComponent={BooleanEditor} />
                    </Scheduler>

                    : <LoadingPage title={'Loading Scheduler'} isShowLogo={false} />
                }
            </Paper>
        </>
    )
}