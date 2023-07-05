import React, { useEffect, useState } from 'react';
import {
    Dialog,
    Button,
    Typography,
    Paper,
    Container,
    Grid,
    Stack,
    styled,
    IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

import PageviewIcon from '@mui/icons-material/Pageview';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Cutomized 
import { CollectionStudentAPI, GENDER, STUDENT_ATTRIBUTES, STUDENT_STATE } from '../../api/CollectionStudentAPI';
import { CollectionContactPersonAPI } from '../../api/CollectionContactPersonAPI';
import { CLASS_FORM_ATTRIBUTES } from '../../api/CollectionClassAPI'
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES } from '../../api/CollectionTuitionRecordAPI';
import { SubpageHeader } from '../SubpageHeader';
import { StudentDetail } from '../StudentDetail'
import { TuitionPayForm, tuitionPayOptionInitObj, TUITION_PAY_OPTION_ATTR } from '../TuitionPayForm'

import { commonStyle_centeredBoxOnTheTopest, commonStyle_vCenterImgText } from '../../components/commonStyle'

import moment from 'moment';
import { FREQUENCY } from '../../api/CollectionPreferenceAPI';
import { ATTENDANCE_ATTRIBUTES } from '../../api/CollectionAttendanceAPI';
import PaymentButton from '../PaymentButton';


export function ClassDetail({ selectedClass, setSelectedClass }) {

    // Mapping
    const frequencyMapping = {
        [FREQUENCY.ONCE]: 'Once',
        [FREQUENCY.WEEKLY]: 'Weekly',
        [FREQUENCY.BIWEEKLY]: 'Biweekly',
        [FREQUENCY.TRIWEEKLY]: 'Triweekly',
        [FREQUENCY.MONTHLY]: 'Monthly'
    }

    const weekDayMapping = [
        { label: 'SUN', color: '#a36d6d' },
        { label: 'MON', color: '#a37a6d' },
        { label: 'TUE', color: '#a1a36d' },
        { label: 'WED', color: '#7fa36d' },
        { label: 'THU', color: '#6da382' },
        { label: 'FRI', color: '#6da3a0' },
        { label: 'SAT', color: '#a36d8b' },
    ]



    const db_student = new CollectionStudentAPI();
    const db_tuitionRecord = new CollectionTuitionRecordAPI();
    const db_contactPerson = new CollectionContactPersonAPI();

    const [openStudentDetail, setOpenStudentDetail] = useState(null)
    const [refreshToggle, setRefreshToggle] = useState(true);
    const [studentListRecord, setStudentListRecord] = useState([]);
    const [refreshAttr, setRefreshAttr] = useState(false);

    const refresh = () => {
        setRefreshToggle(!refreshToggle);
    }


    // DataGrid
    const FIELD_MAPPING = {
        DETAIL: 'detail',
        STUDENT_NAME: STUDENT_ATTRIBUTES.STUDENT_NAME,
        STUDENT_KEY: TUITION_PAY_OPTION_ATTR.STUDENT_KEY,
        LESSON_REMAIN: TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN,
        PAY: 'pay',
    }

    const columns = [
        {
            // ------------- 1. Student detail button, and the link to the <StudentDetail Component>
            field: FIELD_MAPPING.DETAIL, headerName: '', sortable: false, width: 32,
            renderCell: (cellValues) => {
                return (

                    <IconButton aria-label="studentdetail"
                        onClick={(event) => {
                            // console.log("studentKey of this student:", cellValues.row.studentKey)
                            db_student.getDocument(cellValues.row.studentKey).then(studentData => {
                                db_contactPerson.getDocument(studentData[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY]).then((contactPersonData) => {
                                    let contactPersonOjectForDetail = { key: studentData[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY], data: contactPersonData }
                                    setOpenStudentDetail(contactPersonOjectForDetail)
                                })
                            })
                        }}
                    >
                        <PageviewIcon fontSize="inherit" />
                    </IconButton>
                );
            }
        },
        { field: FIELD_MAPPING.STUDENT_NAME, headerName: 'Name', width: 130 },   //--------- 1. Student Name
        { field: FIELD_MAPPING.STUDENT_KEY, headerName: 'Student Key', width: 0 }, //---------- 2. Student Key (hidden for the detail)
        { field: FIELD_MAPPING.LESSON_REMAIN, headerName: 'Remain(Lesson)', width: 135 }, //--------- 4. remained lesson
        {
            // 5. Pay action (for paying tuition)
            field: FIELD_MAPPING.PAY,
            headerName: 'Paid',
            renderCell: (cellValues) => {
                if (cellValues.row[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN] === 0) {
                    return (
                        <PaymentButton
                            studentKey={cellValues.row[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]}
                            studentName={cellValues.row[TUITION_RECORD_ATTRIBUTES.STUDENT_NAME]}
                            classKey={selectedClass.key}
                            // refresh={refresh}
                            isRefresh={refreshToggle}
                            setIsRefresh={setRefreshToggle}
                            parentRefresh={refreshAttr}
                            setParentRefresh={setRefreshAttr}
                        />
                    );
                } else {
                    return null
                }

            }
        }
    ];


    const StackItem = styled(Paper)(({ theme, bgcolor }) => ({
        ...theme.typography.body2,
        padding: '1px',
        fontWeight: '700',
        fontSize: '0.8em',
        width: '50px',
        height: '25px',
        lineHeight: '25px',
        textAlign: 'center',
        color: 'white',
        background: bgcolor
    }));


    const [tuitionRecords, setTuitionRecord] = useState([])
    const [dataGridRow, setDataGridRow] = useState([])

    useEffect(() => {
        // Once get the selectedClass from the properties, 
        if (selectedClass) {
            console.log('useEffect1')
            // fetch the tuition record
            let temp_dataGridRow = [];
            db_tuitionRecord.getCollection().then(tuitionRecords => {
                db_student.getCollection().then(allStudents => {

                    // filter out the tuition record with the class key
                    let tuitionOfhisClass = tuitionRecords.filter(item => item.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY] === selectedClass.key)
                    setTuitionRecord(tuitionOfhisClass);

                    // create dataGridRow
                    selectedClass.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].forEach((student, index) => {

                        let tuitionOfThisStudent = tuitionOfhisClass.find(tuition => tuition.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY] === student.key && (tuition.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false || tuition.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN] > 0))

                        let lessonRemain;
                        if (!tuitionOfThisStudent) {
                            lessonRemain = 0;
                        } else {
                            lessonRemain = tuitionOfThisStudent.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]
                        }

                        temp_dataGridRow.push({
                            id: index,
                            studentKey: student.key,
                            [STUDENT_ATTRIBUTES.STUDENT_NAME]: allStudents.find(_student => _student.key === student.key).data[STUDENT_ATTRIBUTES.STUDENT_NAME],
                            [TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]: lessonRemain,
                        })


                    })

                    setDataGridRow(temp_dataGridRow)

                })
            })

        }
    }, [selectedClass,refreshToggle])


    const Details = () => (
        <Container>
            <Grid container spacing={2}>
                <Grid item xs={12} sx={{
                    fontWeight: 700,
                    fontSize: '2em',
                    marginBottom: '2px',
                    ...commonStyle_vCenterImgText
                }} >
                    {selectedClass.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]}
                </Grid>

                <Grid item xs={12} sx={{
                    fontSize: '0.9em'
                }}>
                    {selectedClass.data[CLASS_FORM_ATTRIBUTES.DESCRIPTION]}
                </Grid>

                {/* Location */}
                <Grid item xs={12} sx={{
                    ...commonStyle_vCenterImgText
                }}>
                    <LocationOnIcon /> {selectedClass.data[CLASS_FORM_ATTRIBUTES.LOCATION]}
                </Grid>

                {/* Start Time */}
                <Grid item xs={12} sx={{
                    ...commonStyle_vCenterImgText
                }}>
                    <AccessTimeIcon /> {moment(selectedClass.data[CLASS_FORM_ATTRIBUTES.LESSON_START_TIME]).format('HH:mm')}
                </Grid>


                <Grid item xs={12}>
                    <Typography component='h4' sx={{
                        marginBottom: '5px',
                        background: '#333',
                        color: 'white',
                        width: '100px',
                        textAlign: 'center',
                        padding: '4px 0px 4px 0px'
                    }}>
                        {frequencyMapping[selectedClass.data[CLASS_FORM_ATTRIBUTES.FREQUENCY]].toUpperCase()}
                    </Typography>

                    <Stack direction='row' spacing={1} >
                        {selectedClass.data[CLASS_FORM_ATTRIBUTES.WEEKDAYS].map((weekday) => (
                            <StackItem bgcolor={weekDayMapping[weekday].color} key={weekDayMapping[weekday].label}> {weekDayMapping[weekday].label}</StackItem>
                        ))}
                    </Stack>

                </Grid>

                <Grid item xs={12}>
                    <Typography>
                        Lesson start date:
                    </Typography>
                    {moment(selectedClass.data[CLASS_FORM_ATTRIBUTES.START_DATE]).format('DD/MM/YYYY')}
                </Grid>

                <Grid item xs={12}>
                    <Typography>
                        Lesson last date:
                    </Typography>
                    {selectedClass.data[CLASS_FORM_ATTRIBUTES.LAST_DATE] ?
                        moment(selectedClass.data[CLASS_FORM_ATTRIBUTES.LAST_DATE]).format('DD/MM/YYYY') :
                        'Not set'
                    }
                </Grid>


                <Grid item xs={12}>
                    Student List:
                    <div style={{ height: '300px', widht: '100%' }}>
                        <DataGrid
                            rows={dataGridRow}
                            columns={columns}
                            initialState={{
                                columns: {
                                    columnVisibilityModel: {
                                        // Hide StudentKey the other columns will remain visible
                                        studentKey: false,
                                    },
                                },
                            }}
                        />
                    </div>
                    {/* <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {selectedClass.data[CLASS_FORM_ATTRIBUTES.SELECTED_STUDENT].map((student) => (
                                <Stack spacing={2} >
                                    <Box>{student.value[STUDENT_ATTRIBUTES.STUDENT_NAME]}</Box>
                                </Stack>

                            ))}
                        </Grid>

                    </Grid> */}
                </Grid>

            </Grid>
        </Container>
    )


    return (
        <>
            <Dialog
                fullScreen
                open={selectedClass ? true : false}
            >
                <SubpageHeader bgcolor="#56ba66" title="Class Detail" onclose={setSelectedClass} textcolor="#333" />
                {/* <Button onClick={refresh} variant='contained'>Refresh</Button> */}
                {selectedClass ? <Details /> : null}
            </Dialog>

            

            <StudentDetail selectedContactPerson={openStudentDetail} setSelectedContactPerson={setOpenStudentDetail} />
        </>
    );
}
