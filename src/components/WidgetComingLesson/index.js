import React, { useEffect, useState } from 'react'
import WidgetFrame from '../WidgetFrame'

import { ATTENDANCE_ATTRIBUTES, ATTENDANCE_STATE, CollectionAttendanceAPI } from '../../api/CollectionAttendanceAPI'
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { ClassDetail } from '../ClassDetail'

import moment from 'moment';

import PageviewIcon from '@mui/icons-material/Pageview';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { Box, Button, ButtonBase, Card, Grid, IconButton, Stack, Typography } from '@mui/material';
import { AttendanceForm } from '../AttendanceForm';

export default function WidgetComingLesson() {
    const db_attendance = new CollectionAttendanceAPI();
    const db_class = new CollectionClassAPI();

    const DAYS_TO_FETCH = 7;

    const [allAttendanceRecord, setAllAttendanceRecord] = useState([]);
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState([]);
    const [allClassRecord, setAllClassRecord] = useState([])
    const [dateList, setDateList] = useState([])

    const [selectedAttendanceKey, setSelectedAttendanceKey] = useState(null)

    const [openClassDetailObj, setOpenClassDetailObj] = useState(null)

    useEffect(() => {
        let temp_dateList = [];

        for (let i = 0, current = moment().set({ hour: 0, minute: 0, second: 0 }); i < DAYS_TO_FETCH; i++) {
            if (i === 0) {
                temp_dateList.push(moment(current));
            } else {
                temp_dateList.push(moment(current).add(i, 'day'))
            }
        }

        setDateList(temp_dateList)

        db_attendance.getCollection().then(attendanceRecords => {

            // Get class info.
            db_class.getCollection().then(classRecords => setAllClassRecord(classRecords));

            setAllAttendanceRecord(attendanceRecords);

            let today = moment().set({ hour: 0, minute: 0, second: 0 });
            let fetchLastDate = moment(today).add(DAYS_TO_FETCH, 'day').set({ hour: 23, minute: 59, second: 59 });

            // console.log('Today', today.format('DD-MM-YYYY'))
            // console.log('fetchLastDate', fetchLastDate.format('DD-MM-YYYY'))

            let _selectedAttendanceRecord = attendanceRecords
                .filter(rec => (moment(rec.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]) >= today
                    && moment(rec.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]) < fetchLastDate))
            setSelectedAttendanceRecord(_selectedAttendanceRecord);
        })
    }, [selectedAttendanceKey])

    const mappingDayText = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const mappingDayBgColor = ['#d14a43', '#fff243', '#d6569b', '#52ab62', '#e08b44', '#3eb4f0', '#80589e']
    const mappingDayTextColor = ['#ffffff', '#000000', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']

    // HANDLER
    const handleOpenClassDetail = (selectedClass) => {
        setOpenClassDetailObj(selectedClass)
    }

    return (
        <>
            <ClassDetail selectedClass={openClassDetailObj} setSelectedClass={setOpenClassDetailObj} />

            <WidgetFrame titleText='UPCOMING LESSONS' >
                {selectedAttendanceRecord.length > 0 && dateList && allClassRecord.length > 0
                    ?
                    <Stack spacing={1}>
                        {dateList.length > 0 ?
                            dateList.map(date => {
                                let isToday = moment().format('DDMMYY') === moment(date).format('DDMMYY')

                                let dateStyle = { fontWeight: 700, transform: 'skew(-15deg,0deg)', fontSize: '1.1em', color: '#32838C' }

                                let noLessonStyle = { textAlign: 'center', padding: '10px' }

                                let lessons = selectedAttendanceRecord.filter(_attendanceRecord => moment(date).set({ hour: 0, minute: 0, second: 0 }) < _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]
                                    && _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME] < moment(date).set({ hour: 23, minute: 59, second: 59 }));

                                return (<>
                                    <Typography key={moment(date).format('DDMMYY')} sx={dateStyle}>
                                        {isToday
                                            ? 'TODAY'
                                            : (lessons.length > 0
                                                ? moment(date).format('DD/MM/YY')
                                                : null)
                                        }
                                    </Typography>

                                    {lessons.length > 0 || !isToday
                                        ? (
                                            lessons.map((_attendanceRecord, i) => {
                                                let selectedClass = allClassRecord.find(rec => rec.key === _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY]);

                                                let className = selectedClass.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME],
                                                    location = selectedClass.data[CLASS_FORM_ATTRIBUTES.LOCATION],
                                                    startTime = _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME],
                                                    endTime = _attendanceRecord.data[ATTENDANCE_ATTRIBUTES.END_DATE_TIME]

                                                // Attendance Ticket
                                                return (
                                                    <Grid container flex direction={'row'} alignItems={'center'} key={`${className}-name-${i}`}>
                                                        {/* Weekdays Box */}
                                                        <Grid item>
                                                            <Typography sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                width: '65px',
                                                                height: '65px',
                                                                borderRadius: '10px',
                                                                fontSize: '1.2em',
                                                                fontWeight: '900',
                                                                background: mappingDayBgColor[moment(date).get('d')],
                                                                color: mappingDayTextColor[moment(date).get('d')]
                                                            }}
                                                            >{mappingDayText[moment(date).get('d')]}</Typography>
                                                        </Grid>

                                                        <Grid item xs={6} sx={{ paddingLeft: '10px' }}>
                                                            <ButtonBase sx={{ display: "flex", flexDirection: 'column', alignItems: 'flex-start', fontSize: '16px' }} onClick={() => handleOpenClassDetail(selectedClass)} >
                                                                {/* Class name */}
                                                                <Typography sx={{
                                                                    fontWeight: '700',
                                                                    fontSize: '1.1em',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}><PageviewIcon sx={{ fontSize: '1em', marginRight: '5px' }} />{className}</Typography>

                                                                {/* Location */}
                                                                <Typography sx={{
                                                                    fontWeight: '500',
                                                                    fontSize: '0.8em',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}><LocationOnIcon sx={{ fontSize: '1em', marginRight: '5px' }} />{location}</Typography>

                                                                {/* Time */}
                                                                <Typography sx={{
                                                                    fontWeight: '500',
                                                                    fontSize: '0.8em',
                                                                    display: 'flex',
                                                                    alignItems: 'center'
                                                                }}><AccessTimeIcon sx={{ fontSize: '1em', marginRight: '5px' }} />{moment(startTime).format('HH:mm')} - {moment(endTime).format('HH:mm')}</Typography>
                                                            </ButtonBase>
                                                        </Grid>
                                                        <Grid item xs={3}>
                                                            {isToday ?
                                                                (<>
                                                                    <AttendanceForm attendancekey={selectedAttendanceKey} setAttendanceKey={setSelectedAttendanceKey}  />

                                                                    <Button variant='contained' color='primary' onClick={() => { setSelectedAttendanceKey(_attendanceRecord.key); }} size="small">
                                                                        {_attendanceRecord.data[ATTENDANCE_ATTRIBUTES.ATTENDANCE_STATE] !== ATTENDANCE_STATE.TICKET ? 'View Attendance' : 'Take Attendance'}
                                                                    </Button>
                                                                </>)
                                                                : null
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                )
                                            })
                                        ) : (
                                            <Typography sx={noLessonStyle}> There are no lessons today.</Typography>
                                        )}

                                </>
                                )
                            })
                            : 'Loading'
                        }

                    </Stack>
                    : <Box sx={{ padding: '20px', textAlign:'center' }}>You have no lesson on coming {DAYS_TO_FETCH} days</Box>
                }

            </WidgetFrame>
        </>

    )
}
