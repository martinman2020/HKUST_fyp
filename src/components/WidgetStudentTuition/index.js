import { Card, Grid, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { CollectionStudentAPI, STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI';
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES, TUITION_RECORD_STATE } from '../../api/CollectionTuitionRecordAPI';
import PaymentButton from '../PaymentButton';
import WidgetFrame from '../WidgetFrame';


function WidgetStudentTuition({ parentRefresh, setParentRefresh }) {

    const db_tuitionRecord = new CollectionTuitionRecordAPI();
    const db_student = new CollectionStudentAPI();
    const db_class = new CollectionClassAPI();

    const [tuitionRecords, setTuitionRecords] = useState([]);
    const [unpaidTuitionRecords, setUnpaidTuitionRecords] = useState([]);
    const [studentNames, setStudentNames] = useState([]);
    const [classData, setClassData] = useState([]);
    const [refreshToggle, setRefreshToggle] = useState(false);

    const refresh = () => {
        setRefreshToggle(!refreshToggle);
    }

    useEffect(() => {
        db_tuitionRecord.getCollection().then((allTuitionRecord) => {
            setTuitionRecords(allTuitionRecord);
            // get the unpaid record;
            let temp_unpaidTuitionRecords = allTuitionRecord.filter(tuitionRecord => tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STATE] === TUITION_RECORD_STATE.NORMAL
                && tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] === false)

            setUnpaidTuitionRecords(temp_unpaidTuitionRecords)

            db_student.getCollection().then(allStudentRecord => setStudentNames(allStudentRecord.map(rec => ({ key: rec.key, [STUDENT_ATTRIBUTES.STUDENT_NAME]: rec.data[STUDENT_ATTRIBUTES.STUDENT_NAME] }))))
            db_class.getCollection().then(allClassRecord => setClassData(allClassRecord.map(rec => ({ key: rec.key, [CLASS_FORM_ATTRIBUTES.CLASS_NAME]: rec.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME] }))))

        })
    }, [refreshToggle])

    let unPaidTagStyle = { fontWeight: 700, transform: 'skew(-15deg,0deg)', fontSize: '1.1em', color: '#C42400', paddingBottom: '15px' }
    let noUnpaidRecordStyle = { textAlign: 'center', padding: '20px' }
    let studentNameStyle = { fontSize: '1.2em', fontWeight: '700', color: '#32838C' }
    let classNameStyle = { fontSize: '0.8em', color: '#555', fontWeight: '500' }
    let lessonRemainStyle = { ...classNameStyle, color: '#E11', fontWeight: '400' }

    return (
        <WidgetFrame titleText='UNPAID TUITION' background='#32838C22'>
            <>
                {/* <Typography component={'h3'} sx={unPaidTagStyle}>UNPAID</Typography> */}
            </>
            {unpaidTuitionRecords.length > 0
                ? (
                    <>
                        <Stack spacing={1}>
                            {studentNames && classData ?
                                unpaidTuitionRecords.map(_tuitionRecords => {
                                    let currentStudent = studentNames.find(rec => rec.key === _tuitionRecords.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY])
                                    let currentClass = classData.find(rec => rec.key === _tuitionRecords.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY])
                                    return (
                                        <Card key={_tuitionRecords.key} sx={{ padding: '10px' }}>
                                            <Grid container>
                                                <Grid item xs={6} >
                                                    <Typography sx={studentNameStyle}>{currentStudent ? currentStudent[STUDENT_ATTRIBUTES.STUDENT_NAME] : '404 Not Found'}</Typography>

                                                    <Typography sx={classNameStyle}>{currentClass ? currentClass[CLASS_FORM_ATTRIBUTES.CLASS_NAME] : '404 Not Found'}</Typography>

                                                    <Typography sx={lessonRemainStyle}>Remains {_tuitionRecords.data[TUITION_RECORD_ATTRIBUTES.LESSON_REMAIN]} lesson</Typography>
                                                </Grid>
                                                <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '10px' }}>
                                                    <PaymentButton
                                                        classKey={_tuitionRecords.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY]}
                                                        studentName={currentStudent ? currentStudent[STUDENT_ATTRIBUTES.STUDENT_NAME] : '404 Not Found'}
                                                        studentKey={_tuitionRecords.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]}
                                                        refresh={refresh}
                                                        parentRefresh={parentRefresh}
                                                        setParentRefresh={setParentRefresh}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    )
                                })
                                : 'Loading'}
                        </Stack>
                    </>
                )
                : (<><Typography sx={noUnpaidRecordStyle}> There are no unpaid records </Typography></>)
            }
        </WidgetFrame>
    )
}

export default WidgetStudentTuition