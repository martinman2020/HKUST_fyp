import React, { useState, useEffect } from 'react'

import { CollectionPreferenceAPI, FREQUENCY, PREFERENCE_ATTRIBUTES, frequencyLabelMapping } from '../../api/CollectionPreferenceAPI'
import { CollectionLocationAPI, LOCATION_ATTRIBUTES } from '../../api/CollectionLocationAPI'
import { CollectionStudentAPI, STUDENT_ATTRIBUTES, STUDENT_STATE } from '../../api/CollectionStudentAPI'
import { CollectionClassAPI, CLASS_FORM_ATTRIBUTES, CLASS_STATE, WEEKDAY } from '../../api/CollectionClassAPI'
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES, TUITION_RECORD_STATE } from '../../api/CollectionTuitionRecordAPI'
import { CollectionAttendanceAPI, ATTENDANCE_ATTRIBUTES, ATTENDANCE_STATE, BEFORE_AFTER } from '../../api/CollectionAttendanceAPI'
import Snackbars, { initSnackBarsOption } from '../SnackBars'

import { MultiSelect } from 'react-multi-select-component'

// MUI
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Grid,
    Button,
    Box,
    Dialog,
    Checkbox,
    Switch,
    FormGroup,
    FormControlLabel,
    FormLabel,
    Typography,
    Popover,
    IconButton
} from '@mui/material'
import { DateTimePicker, DatePicker, TimePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


// Moment.js
import moment from 'moment'
import { commonStyle_centeredBoxOnTheTopest } from '../commonStyle'
import PopupDialogFrame from '../PopupDialogFrame'


const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export function ClassCreateForm({ isOpen, setIsOpen, selectedClass, setSelectedClass, refresh, setRefresh }) {

    const [formData, setFormData] = useState(selectedClass ? selectedClass.data : {})
    const [studentKeyListBefore, setStudentKeyListBefore] = useState([])

    const weekdayFormOption = [
        { label: 'Sun', value: WEEKDAY.SUNDAY, color: 'red' },
        { label: 'Mon', value: WEEKDAY.MONDAY, color: 'black' },
        { label: 'Tue', value: WEEKDAY.TUESDAY, color: 'black' },
        { label: 'Wed', value: WEEKDAY.WEDNESDAY, color: 'black' },
        { label: 'Thu', value: WEEKDAY.THURSDAY, color: 'black' },
        { label: 'Fri', value: WEEKDAY.FRIDAY, color: 'black' },
        { label: 'Sat', value: WEEKDAY.SATURDAY, color: 'red' },
    ]

    const mapClassState = [
        { label: 'Normal', value: CLASS_STATE.NORMAL },
        { label: 'Terminated', value: CLASS_STATE.TERMINATED },
        { label: 'Suspened', value: CLASS_STATE.SUSPENDED },
    ]


    const [preference, setPreference] = useState()  // for preference

    // for create student option list
    const [students, setStudents] = useState()
    const [studentOptions, setStudentOptions] = useState();
    const [selectedStudents, setSelectedStudents] = useState(selectedClass ? selectedClass.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT] : []);

    const [location, setLocation] = useState([]);     // For location option list

    const [isEnableLastDaySwitch, setIsEnableLastDaySwitch] = useState(selectedClass && selectedClass.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] ? true : false);
    const [isShowWeekdayBox, setIsShowWeekdayBox] = useState(false);
    const [isShowLastDaySwitch, setIsShowLastDaySwitch] = useState(false);
    const [selectedWeekday, setSelectedWeekday] = useState(selectedClass ? selectedClass.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS] : []);

    // Database API
    const db_preference = new CollectionPreferenceAPI();
    const db_student = new CollectionStudentAPI();
    const db_location = new CollectionLocationAPI();
    const db_tuitionRecord = new CollectionTuitionRecordAPI();
    const db_class = new CollectionClassAPI();
    const db_attendance = new CollectionAttendanceAPI();

    const initialClassFormObj = {
        [CLASS_FORM_ATTRIBUTES.CLASS_NAME]: '',
        [CLASS_FORM_ATTRIBUTES.DESCRIPTION]: '',
        [CLASS_FORM_ATTRIBUTES.START_DATE]: new Date(),
        [CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]: new Date(moment().set({ 'hour': 15, 'minute': 0 })),
        [CLASS_FORM_ATTRIBUTES.LOCATION]: '',
        [CLASS_FORM_ATTRIBUTES.DURATION_MIN]: preference ? preference[PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN] : '',
        [CLASS_FORM_ATTRIBUTES.FREQUENCY]: preference ? preference[PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY] : '',
        [CLASS_FORM_ATTRIBUTES.LAST_DATE]: null
    }

    // create student options for Select component 
    const createStudentOptions = (_students) => {
        let options = [];
        if (!_students) return [];
        // hide all the 'hidden' student
        let availableStudents = _students.filter(student => student.data[STUDENT_ATTRIBUTES.STATE] === STUDENT_STATE.NORMAL)
        availableStudents.forEach(student => {
            // get the required variable
            let studentKey = student.key,
                studentName = student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]

            // add the record to the options array
            options.push({
                key: studentKey,
                [CLASS_FORM_ATTRIBUTES.STUDENT_STATE]: STUDENT_STATE.NORMAL,
                [STUDENT_ATTRIBUTES.STUDENT_NAME]: studentName,
            })
        })
        return options;
    }

    /**
     *  while the component load, fetch preference/ location/ students 
     */
    useEffect(() => {
        db_preference.getPreference().then(res => setPreference(res))

        db_location.getCollection(false).then(res => setLocation(res));

        db_student.getCollection().then(res => {
            setStudents(res);
            setStudentOptions(createStudentOptions(res))
        })
    }, [])

    /**
    *  UseEffects 
    *  */
    useEffect(() => {
        if (isOpen) {
            if (!selectedClass) {
                setFormData(initialClassFormObj);
            } else {
                setStudentKeyListBefore(selectedClass.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].map(item => item.key))
            }
        } else {
            setFormData(initialClassFormObj)
        }

    }, [isOpen])

    useEffect(() => {
        if (formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.ONCE) {
            setIsShowLastDaySwitch(false);
            setIsShowWeekdayBox(false)
            setFormData({
                ...formData
                , [CLASS_FORM_ATTRIBUTES.LAST_DATE]: new Date(moment(formData[CLASS_FORM_ATTRIBUTES.START_DATE]))
            })
            setSelectedWeekday([])

        } else if (formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.WEEKLY
            || formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.BIWEEKLY
            || formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.TRIWEEKLY
        ) {
            setIsShowWeekdayBox(true)
            setIsShowLastDaySwitch(true);

        } else {
            setIsShowLastDaySwitch(true);
            setIsShowWeekdayBox(false);
            setSelectedWeekday([])
        }
    }, [formData[CLASS_FORM_ATTRIBUTES.FREQUENCY]])

    // While the user selected the start date time, the system will auto select the weekday
    useEffect(() => {
        if (!selectedClass) {
            if (formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.WEEKLY
                || formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.BIWEEKLY
                || formData[CLASS_FORM_ATTRIBUTES.FREQUENCY] === FREQUENCY.TRIWEEKLY
            ) {
                if (formData[CLASS_FORM_ATTRIBUTES.START_DATE]) {
                    let day = new Date(formData[CLASS_FORM_ATTRIBUTES.START_DATE]).getDay();
                    // let temp_weekday = selectedWeekday
                    // if (!selectedWeekday.includes(day.toString())) {
                    //     temp_weekday.push(day.toString())
                    //     let tmp = temp_weekday
                    //     setSelectedWeekday(tmp)
                    // }
                    setSelectedWeekday([day.toString()]);
                }
            }
        }

    }, [formData[CLASS_FORM_ATTRIBUTES.START_DATE]])


    /**
     *  Handle the last day switch
     *  */
    useEffect(() => {
        if (isEnableLastDaySwitch) {
            setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.LAST_DATE]: (selectedClass ? selectedClass.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] : new Date(moment().add(14, 'd').set({ 'hour': 0, 'minute': 0, 'second': 0 }))) });
        } else {
            setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.LAST_DATE]: null });
        }
    }, [isEnableLastDaySwitch])

    const [snackBarsOption, setSnackBarsOption] = useState(initSnackBarsOption)

    const handleCloseSnackBar = () => {
        setSnackBarsOption({ ...snackBarsOption, isShow: false })
    }

    const checkingInput = () => {
        let errorOption = { isShow: true, type: 'error' }

        if (formData[CLASS_FORM_ATTRIBUTES.CLASS_NAME].length < 5) {
            setSnackBarsOption({ ...errorOption, message: 'The class name must has at least 5 characters.' })
            return false;
        }

        if (moment(formData[CLASS_FORM_ATTRIBUTES.START_DATE]) > moment(formData[CLASS_FORM_ATTRIBUTES.LAST_DATE])) {
            setSnackBarsOption({ ...errorOption, message: 'The start date of the class must be earlier then the end date.' })
            return false;
        }

        if (isEnableLastDaySwitch && (!formData[CLASS_FORM_ATTRIBUTES.LAST_DATE] || !(formData[CLASS_FORM_ATTRIBUTES.LAST_DATE] instanceof Date))) {
            setSnackBarsOption({ ...errorOption, message: 'The last date switch is on, please select the last date of the class' })
            return false;
        }

        if (selectedStudents.length < 1) {
            setSnackBarsOption({ ...errorOption, message: 'The class name must include at least 1 student.' })
            return false;
        }

        return true;
    }

    const handleSubmit = () => {
        if (!checkingInput()) {
            return
        }
        // Add the class to database
        let submitFormData = {
            ...formData,
            // trim the space of the content
            [CLASS_FORM_ATTRIBUTES.CLASS_NAME]: formData[CLASS_FORM_ATTRIBUTES.CLASS_NAME].trim(),
            [CLASS_FORM_ATTRIBUTES.DESCRIPTION]: formData[CLASS_FORM_ATTRIBUTES.DESCRIPTION] ? formData[CLASS_FORM_ATTRIBUTES.DESCRIPTION].trim() : '',
            [CLASS_FORM_ATTRIBUTES.LOCATION]: formData[CLASS_FORM_ATTRIBUTES.LOCATION] ? formData[CLASS_FORM_ATTRIBUTES.LOCATION].trim() : '',
            // -----------------------------

            // add the addition init information
            [CLASS_FORM_ATTRIBUTES.CREATED_DATE_TIME]: new Date().getTime(),    // Add the timeStamp 
            [CLASS_FORM_ATTRIBUTES.STATE]: CLASS_STATE.NORMAL,                  // Add the default state
            // ----------------------------

            // combine the weekday/ selectedStudent to record
            [CLASS_FORM_ATTRIBUTES.WEEKDAYS]: selectedWeekday,                  // Add the selected week day
            [CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT]: selectedStudents          // Combine the selected Students
            // ----------------------------
        }

        // Create the class to get the key.
        db_class.addDocument(submitFormData)
            .then(result => {

                const newRecord = result.data;

                // console.log('after added the class, the result is: ', result)
                // to use the new data from result => result.data === {key:..., data:{...}}

                // Create tuition record. and set the [unpaid] state of the
                db_tuitionRecord.createRecordByClassRecord(newRecord);

                // check whether has last day: if no, generate the attendance ticket within 1 year.
                let endDate = newRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] ? newRecord.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] : new Date(moment(newRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE]).add(1, 'y').set({ 'hours': 23, 'minute': 59 }))



                // Check if the location is unique, yes then save as new location,
                // if the location is existed, the specific count +1

                if (formData[CLASS_FORM_ATTRIBUTES.LOCATION] && formData[CLASS_FORM_ATTRIBUTES.LOCATION].trim() !== "") {
                    db_location.updateLocation(formData[CLASS_FORM_ATTRIBUTES.LOCATION].trim());
                }

                db_attendance.replaceTicketByPeriod(newRecord, newRecord.data[CLASS_FORM_ATTRIBUTES.START_DATE], endDate).then(() => {
                    // After the form is submited, init the form 
                    setFormData(initialClassFormObj)

                    setSelectedWeekday([])

                    setSelectedStudents([])

                    setRefresh(!refresh)

                    setIsOpen(false);
                })

            })

    }

    const handleUpdate = () => {
        if (!checkingInput()) {
            return
        }
        // TODO: create a confirmation dialog that the exsit student are deleted.
        let classKey = selectedClass.key

        // combine formData with selected students and weekday
        let combinedFormData = {
            ...formData,
            [CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT]: selectedStudents,
            [CLASS_FORM_ATTRIBUTES.WEEKDAYS]: selectedWeekday
        }

        // CORRECT combianation
        // console.log('before: ', studentKeyListBefore); // DEBUG - the student key list that before modification
        // console.log('after:', selectedStudents.map(item => item.key)) // DEBUG - the student key after modification

        // get new added student
        const studentNeedToAddArray = selectedStudents.filter(item => !studentKeyListBefore.includes(item.key))
        // add tuition record for those student
        studentNeedToAddArray.forEach((student) => { db_tuitionRecord.createRecordByStudentKey(student.key, classKey) })
        console.log('studentNeedToAddArray', studentNeedToAddArray)


        // get deleted student
        // terminate the tuition Record for those student
        const studentKeyNeedToDeleteArray = studentKeyListBefore.filter(item => !selectedStudents.map(student => student.key).includes(item))
        studentKeyNeedToDeleteArray.forEach(key => { db_tuitionRecord.setTerminateTuition(classKey, key) })
        console.log('studentKeyNeedToDeleteArray', studentKeyNeedToDeleteArray)


        // a function to check two arrays are the same regardless order
        let isWeekdaysSame = (arr_a, arr_b) => {
            let result = true

            if (arr_a.length !== arr_b.length) {
                return false
            } else {
                arr_a.forEach(element => {
                    if (!arr_b.includes(element)) {
                        console.log('not same weekday 1')
                        result = false;
                    }
                });

                arr_b.forEach(element => {
                    if (!arr_a.includes(element)) {
                        console.log('not same weekday 1')
                        result = false;
                    }
                });

                return result
            }
        }

        // get the previous class record for comparison. 
        db_class.getDocument(selectedClass.key).then(res => {
            // if the start date are same.
            let dateFormatForMomonet = 'YYYYMMDD'
            let paraFormData = { key: selectedClass.key, data: combinedFormData }

            // overwrite to database with the lastest record.
            db_class.overwriteDocument(selectedClass.key, combinedFormData)

            if (
                moment(res[CLASS_FORM_ATTRIBUTES.START_DATE]).format(dateFormatForMomonet) === moment(formData[CLASS_FORM_ATTRIBUTES.START_DATE]).format(dateFormatForMomonet)  // the start date are same
                || moment(formData[CLASS_FORM_ATTRIBUTES.START_DATE]) < moment()    // start date in formData is past
            ) {
                console.log(' The start date doesn\'t change or the start date in formData is past. the attendance in the past cannot be changed')
                // if the weekdays and the frequency has changed.
                if (
                    !isWeekdaysSame(res[CLASS_FORM_ATTRIBUTES.WEEKDAYS], selectedWeekday) // the weekday has changed
                    || res[CLASS_FORM_ATTRIBUTES.FREQUENCY] !== formData[CLASS_FORM_ATTRIBUTES.FREQUENCY]
                    || moment(res[CLASS_FORM_ATTRIBUTES.LAST_DATE]).format('YYYYMMDD') !== moment(formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]).format('YYYYMMDD')
                    || moment(res[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).format('HHmm') !== moment(formData[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).format('HHmm')
                ) { // the freuency has changed
                    if (formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]) {
                        return db_attendance.deleteTicket(selectedClass.key, BEFORE_AFTER.AFTER, formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]).then(() => db_attendance.replaceTicketByPeriod(paraFormData, new Date(), formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]))
                    } else {
                        return db_attendance.replaceTicketByPeriod(paraFormData, new Date(), formData[CLASS_FORM_ATTRIBUTES.LAST_DATE])
                    }
                }
            } else {
                // the start date in formData is furture
                if (moment(formData[CLASS_FORM_ATTRIBUTES.START_DATE]) > moment(res[CLASS_FORM_ATTRIBUTES.START_DATE])) { // new start date is earlier then old start date
                    return db_attendance.deleteTicket(selectedClass.key, BEFORE_AFTER.BEFORE, formData[CLASS_FORM_ATTRIBUTES.START_DATE])
                        .then(() => db_attendance.replaceTicketByPeriod(paraFormData, formData[CLASS_FORM_ATTRIBUTES.START_DATE], formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]))
                } else {
                    return db_attendance.replaceTicketByPeriod(paraFormData, formData[CLASS_FORM_ATTRIBUTES.START_DATE], formData[CLASS_FORM_ATTRIBUTES.LAST_DATE])
                }
            }
        }).then(() => {
            setRefresh(!refresh)
            setIsOpen(false)
        })
    }

    // handle weekday check box selection
    const handleCheckeWeekday = async (event) => {
        // console.log(event.target.value)
        if (event.target.checked) {
            setSelectedWeekday([...selectedWeekday, event.target.value.toString()])
        } else {
            let temp_weekDay = selectedWeekday.filter(item => item != event.target.value)
            setSelectedWeekday(temp_weekDay)
        }
    }

    const handleClose = () => {
        if (selectedClass && setSelectedClass) {
            setSelectedClass(null)
        }
        setSelectedStudents([]);
        setIsOpen(false);
    }

    // Sub Component
    const WeekdaySection = () => (
        <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" >Select weekday</FormLabel>

            <FormGroup aria-label="position" row sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {weekdayFormOption.map(item => (
                    <FormControlLabel
                        key={item.label}
                        value={item.value.toUpperCase()}
                        checked={selectedWeekday.includes(item.value)}
                        control={<Checkbox onChange={(e) => handleCheckeWeekday(e)} />}
                        label={<span style={{ fontSize: '0.8em', fontWeight: '700', color: item.color, padding: '3px', textTransform: "uppercase" }}>{item.label}</span>}
                        labelPlacement="top"
                        sx={{ margin: '1px', background: '#eee', borderRadius: '5px' }}
                    />
                ))}
            </FormGroup>
        </FormControl>
    )

    // const ClassStateField = () => selectedClass ? (
    //     <FormControl fullWidth>
    //         <InputLabel>Class State</InputLabel>
    //         <Select labelId="State"
    //             variant='outlined'
    //             id="Class State"
    //             value={formData[CLASS_FORM_ATTRIBUTES.STATE]}
    //             label="Class State"
    //             onChange={(e) => {
    //                 setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.STATE]: e.target.value })
    //             }}
    //         >
    //             {mapClassState.map(item => (
    //                 <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
    //             ))}

    //         </Select>
    //     </FormControl>
    // ) : null


    return (
        <>
            <Snackbars {...snackBarsOption} onClose={handleCloseSnackBar} />
            {((preference && students) || selectedClass) ? (
                // <Dialog open={isOpen}
                //     onClose={(event, reason) => {
                //         // Prevent close on clicking the backdrop
                //         if (reason && reason == 'backdropClick')
                //             return;
                //         setIsOpen(false)
                //     }}
                //     sx={{
                //         display: 'flex',
                //         justifyContent: 'center',
                //         alignItems: 'center'
                //     }}
                // >
                //     <Box
                //         sx={{
                //             ...commonStyle_centeredBoxOnTheTopest,
                //         }}
                //     >
                <PopupDialogFrame isOpen={isOpen} title={
                    selectedClass ? (
                        "Class Update Form"
                    ) : (
                        "Class Creation Form"
                    )}
                    onClose={() => handleClose()}
                    onSubmit={selectedClass ? (handleUpdate) : (handleSubmit)}
                >

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField id="className"
                                fullWidth
                                label="Class Name"
                                variant="outlined"
                                value={formData[CLASS_FORM_ATTRIBUTES.CLASS_NAME]}
                                // helperText="If the class empty, the class is set by default format => location(students...) eg: Mong Kok (Kiwi,Martin,Miffy,... ) "
                                onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.CLASS_NAME]: e.target.value }) }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="Description"
                                label="Description (Optional)"
                                variant="outlined"
                                value={formData[CLASS_FORM_ATTRIBUTES.DESCRIPTION]}
                                onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.DESCRIPTION]: e.target.value }) }}
                                multiline
                            />
                        </Grid>

                        {/* <Grid item xs={12}>
                            <ClassStateField />
                        </Grid> */}

                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    renderInput={(props) => <TextField fullWidth {...props} />}
                                    label="Start Date"
                                    value={formData[CLASS_FORM_ATTRIBUTES.START_DATE]}
                                    onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.START_DATE]: new Date(moment(e).set({ 'hour': 0, 'minute': 0, 'second': 0 })) }) }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <TimePicker
                                    renderInput={(props) => <TextField fullWidth {...props} />}
                                    label="Lesson Starting Time"
                                    minutesStep={5}
                                    value={formData[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]}
                                    onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]: new Date(moment(e).set({ 'second': 0 })) }) }}
                                />
                            </LocalizationProvider>

                        </Grid>


                        <Grid item xs={6}>
                            <TextField
                                id="duration"
                                label="Class Duration (Mins)"
                                type="number"
                                variant="outlined"
                                value={formData[CLASS_FORM_ATTRIBUTES.DURATION_MIN]}
                                onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.DURATION_MIN]: e.target.value }) }}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>


                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Frequency</InputLabel>
                                <Select labelId="Frequency"
                                    variant='outlined'
                                    id="classFrequency"
                                    value={formData[CLASS_FORM_ATTRIBUTES.FREQUENCY]}
                                    label="Frequency"
                                    onChange={(e) => {
                                        setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.FREQUENCY]: e.target.value })
                                    }}
                                >
                                    {frequencyLabelMapping.map(item => (
                                        <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                    ))}

                                </Select>
                            </FormControl>
                        </Grid>

                        {isShowWeekdayBox ?
                            (<Grid item xs={12}>
                                <WeekdaySection />
                            </Grid>) : null
                        }


                        {isShowLastDaySwitch ? (
                            <>
                                <Grid item xs={8}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns} >
                                        <DatePicker
                                            disabled={!isEnableLastDaySwitch}
                                            renderInput={(props) => <TextField {...props} />}
                                            minDate={formData[CLASS_FORM_ATTRIBUTES.START_DATE]}
                                            label="Last Date"
                                            value={formData[CLASS_FORM_ATTRIBUTES.LAST_DATE]}
                                            onChange={(e) => { setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.LAST_DATE]: new Date(moment(e).set({ 'hour': 23, 'minute': 59, 'second': 59 })) }) }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={4} sx={{
                                    display: 'flex'
                                    , alignItems: 'center'
                                    , justifyContent: 'flex-start'
                                }}>
                                    {/* <FormGroup>
                                        <FormControlLabel
                                            control={<Switch onChange={() => setIsEnableLastDaySwitch(!isEnableLastDaySwitch)}
                                                checked={isEnableLastDaySwitch} />}
                                            label="End Date"
                                        />
                                    </FormGroup> */}
                                    <Switch
                                        onChange={() => setIsEnableLastDaySwitch(!isEnableLastDaySwitch)}
                                        checked={isEnableLastDaySwitch} />
                                </Grid>
                            </>
                        ) : null}


                        <Grid item xs={12}>
                            <Autocomplete
                                id="location"
                                freeSolo
                                value={selectedClass ? selectedClass.data[CLASS_FORM_ATTRIBUTES.LOCATION] : ''}
                                options={location.map((option) => option[LOCATION_ATTRIBUTES.LABEL])}
                                renderInput={(params) => <TextField {...params} label="Location" />}
                                onInputChange={(event, newInputValue) => {
                                    setFormData({ ...formData, [CLASS_FORM_ATTRIBUTES.LOCATION]: newInputValue })
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            Select Students :
                            {studentOptions === undefined ? <span>Loading</span> :
                                <Autocomplete
                                    multiple
                                    id="selectedStudent"
                                    disableCloseOnSelect
                                    options={studentOptions}
                                    getOptionLabel={(option) => option[STUDENT_ATTRIBUTES.STUDENT_NAME]}
                                    isOptionEqualToValue={(option, value) => option[STUDENT_ATTRIBUTES.STUDENT_NAME] === value[STUDENT_ATTRIBUTES.STUDENT_NAME]}
                                    value={selectedStudents}
                                    onChange={(e, value) => { setSelectedStudents(value) }}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            // checked={isStudentOptionChecked(option[STUDENT_ATTRIBUTES.STUDENT_NAME])}
                                            />
                                            {option[STUDENT_ATTRIBUTES.STUDENT_NAME]}
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            variant="standard"
                                            label="Students"
                                            placeholder="Student in class"
                                        />
                                    )}
                                />
                                // (
                                //     <MultiSelect
                                //         options={studentOptions}
                                //         value={selectedStudents}
                                //         onChange={handleSelectStudent}
                                //         labelledBy='Select students' />
                                // )
                            }
                        </Grid>

                        {/* <Grid item xs={12}
                            sx={{
                                paddingTop: '35px'
                            }}>
                            <Grid container spacing={2}>
                                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                                    {selectedClass ? (
                                        <Button variant='contained' onClick={() => handleUpdate()}>Update</Button>
                                    ) : (
                                        <Button variant='contained' onClick={() => handleSubmit()}>Submit</Button>
                                    )}
                                </Grid>

                                <Grid item xs={6} sx={{ textAlign: 'center' }}>
                                    <Button variant='outlined' onClick={() => handleClose()}>Close</Button>
                                </Grid>

                            </Grid>
                        </Grid> */}

                    </Grid>
                </PopupDialogFrame>

                //     </Box>
                // </Dialog>
            ) : null}
        </>
    )
}