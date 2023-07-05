import React, { useEffect, useState } from 'react';
import {
  Accordion
  , AccordionSummary
  , AccordionDetails
  , Dialog
  , Typography
  , List
  , ListItem
  , ListItemText,
  Container,
  Grid,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack

} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';


import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import PaidIcon from '@mui/icons-material/Paid';


import { CollectionStudentAPI, GENDER, STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI';
import { CollectionContactPersonAPI, CONTACT_PERSON_ATTRIBUTES } from '../../api/CollectionContactPersonAPI';
import { CollectionTuitionRecordAPI, TUITION_RECORD_ATTRIBUTES } from '../../api/CollectionTuitionRecordAPI';
import { CollectionAttendanceAPI, ATTENDANCE_ATTRIBUTES } from '../../api/CollectionAttendanceAPI';
import { CollectionStudentAttendanceAPI, STUDENT_ATTENDANCE_ATTR } from '../../api/CollectionStudentAttendanceAPI'
import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import PropTypes from 'prop-types';

import { SubpageHeader } from '../SubpageHeader';
import { commonStyle_vCenterImgText } from '../../components/commonStyle'


import moment from 'moment';
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI';
import { CURRENCY } from '../../preset/preference'
import { positions } from '@mui/system';

export function StudentDetail({ selectedContactPerson, setSelectedContactPerson }) {
  // API
  const db_contactPerson = new CollectionContactPersonAPI();
  const db_tuitionRecord = new CollectionTuitionRecordAPI();
  const db_attendance = new CollectionAttendanceAPI();
  const db_studentAttendance = new CollectionStudentAttendanceAPI();
  const db_class = new CollectionClassAPI();
  const db_preference = new CollectionPreferenceAPI();

  const [studentList, setStudentList] = useState();
  const [isSignleStudent, setIsSignleStudent] = useState();
  const [rowsTuitionRecord, setRowsTuitionRecord] = useState([]);
  const [rowsAttendaceRecord, setRowsAttendaceRecord] = useState([]);
  const [selectedAttendanceRecordIndex, setSelectedAttendanceRecordIndex] = useState(0)
  const [currency, setCurrency] = useState(null);


  useEffect(() => {
    console.log('StudentDetail : selectedContactPerson is', selectedContactPerson)
    if (selectedContactPerson) {
      db_preference.getCurrency().then(res => setCurrency(res));
      db_contactPerson.isSingleStudent(selectedContactPerson).then(res => setIsSignleStudent(res));
      db_contactPerson.getStudentsList(selectedContactPerson.key).then(students => {
        setStudentList(students)
      });
      getTuitionRecordDataGridRows().then(res => setRowsTuitionRecord(res))
      getAttendanceDataGridRows().then(res => setRowsAttendaceRecord(res))
    }
  }, [selectedContactPerson])


  // styles
  const style_smallIcon = {
    fontSize: '1.1em'
  }

  const style_listIcon = {
    fontSize: '1em',
    positions: 'absolute',
    top: 0,

  }


  const genderMappingColor = {
    [GENDER.FEMALE]: 'rgb(219,85,164)',
    [GENDER.MALE]: 'rgb(72,159,248)',
    [GENDER.NONE]: '#eee'
  }

  // mapping data for the gender
  const genderMapping = {
    [GENDER.FEMALE]: <FemaleIcon sx={{ ...style_smallIcon, color: genderMappingColor[GENDER.FEMALE] }} />,
    [GENDER.MALE]: <MaleIcon sx={{ ...style_smallIcon, color: genderMappingColor[GENDER.MALE] }} />,
    [GENDER.NONE]: null
  }

  // DataGrid columns & rows - Tuition Record
  // LessonRemain Tuition isPaid PayDate ClassName
  const TUITION_RECORD_DATA_GRID_ATTR = {
    PAID: 'paid',
    STUDENT_KEY: 'studentKey',
    STUDENT_NAME: STUDENT_ATTRIBUTES.STUDENT_NAME,
    CLASS_NAME: CLASS_FORM_ATTRIBUTES.CLASS_NAME,
    TUITION: TUITION_RECORD_ATTRIBUTES.TUITION_VALUE,
    PAY_DATE: TUITION_RECORD_ATTRIBUTES.PAY_DATE,
    AMOUNT_OF_LESSONS: TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON
  }
  const columnsTuitionRecord = [
    {
      field: TUITION_RECORD_DATA_GRID_ATTR.PAID
      , headerName: 'Paid'
      , width: 55
    },
    // {
    //   field: TUITION_RECORD_DATA_GRID_ATTR.STUDENT_NAME
    //   , headerName: 'Student'
    //   , width: 120
    // },
    {
      field: TUITION_RECORD_DATA_GRID_ATTR.CLASS_NAME,
      headerName: 'Class',
      width: 150,
    },
    {
      field: TUITION_RECORD_DATA_GRID_ATTR.PAY_DATE,
      headerName: 'Pay date',
      width: 85,
      type: 'date',
      valueFormatter: (params) => {
        let valueFormatted = params.value ? moment(params.value).format('DD/MM/YY') : 'NULL'
        return valueFormatted;
      }
    },
    {
      field: TUITION_RECORD_DATA_GRID_ATTR.TUITION,
      headerName: 'Tuition',
      width: 80,
      valueFormatter: (params) => {
        return params.value;
      }
    },
    {
      field: TUITION_RECORD_DATA_GRID_ATTR.AMOUNT_OF_LESSONS,
      headerName: 'Lessons',
      width: 80,
    }
  ];

  const getTuitionRecordDataGridRows = async () => {

    let dataGridRows = []
    let students, allTuitionRecords, selectedTuitionRecords, allclassData;

    students = await db_contactPerson.getStudentsList(selectedContactPerson.key);
    allTuitionRecords = await db_tuitionRecord.getCollection();
    selectedTuitionRecords = allTuitionRecords.filter(tuitionRecord => students.map(student => student.key).includes(tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY]))
    allclassData = await db_class.getCollection();

    selectedTuitionRecords.forEach(async tuitionRecord => {
      let className = allclassData.find(element => element.key === tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.CLASS_KEY]).data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]
      let selectedStudent = students.find(element => element.key === tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.STUDENT_KEY])

      dataGridRows.push({
        id: tuitionRecord.key,
        [TUITION_RECORD_DATA_GRID_ATTR.PAID]: tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.IS_PAID] ? 'Yes' : 'No',
        [TUITION_RECORD_DATA_GRID_ATTR.CLASS_NAME]: className,
        [TUITION_RECORD_DATA_GRID_ATTR.STUDENT_NAME]: selectedStudent.data[STUDENT_ATTRIBUTES.STUDENT_NAME],
        [TUITION_RECORD_DATA_GRID_ATTR.STUDENT_KEY]: selectedStudent.key,
        [TUITION_RECORD_DATA_GRID_ATTR.TUITION]: tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.TUITION_VALUE],
        [TUITION_RECORD_DATA_GRID_ATTR.AMOUNT_OF_LESSONS]: tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.AMOUNT_OF_LESSON],
        [TUITION_RECORD_DATA_GRID_ATTR.PAY_DATE]: tuitionRecord.data[TUITION_RECORD_ATTRIBUTES.PAY_DATE]
      })
    })

    console.log('StudentDetail : getTuitionRecordDataGridRows : dataGridRows :', dataGridRows)

    return dataGridRows
  }


  const ATTENDANCE_DATA_GRID_ATTR = {
    STUDENT_KEY: 'studentKey',
    STUDENT: 'student',
    CLASSNAME: 'className',
    DATE_TIME: 'dateTime',
    DATE_TIME_M: 'dateTimeMoment',
    IS_PRESENT: 'isPresent',
    IS_LATE: 'isLate',
    NOTE: 'note'
  }

  const columnsAttendaceRecord = [
    {
      field: ATTENDANCE_DATA_GRID_ATTR.CLASSNAME,
      headerName: 'Class',
      width: 150,

    },
    {
      type: 'date',
      field: ATTENDANCE_DATA_GRID_ATTR.DATE_TIME,
      headerName: 'Date Time',
      width: 120,
      valueFormatter: (params) => {
        let valueFormatted = moment(params.value).format('DD/MM/YY HH:mm')
        return valueFormatted;
      }
    },
    {
      field: ATTENDANCE_DATA_GRID_ATTR.IS_PRESENT,
      headerName: 'Present',
      width: 80,
      valueFormatter: (params) => {
        return params.value ? 'YES' : 'NO'
      }
    },
    {
      field: ATTENDANCE_DATA_GRID_ATTR.IS_LATE,
      headerName: 'Late',
      width: 60,
      valueFormatter: (params) => {
        return params.value ? 'YES' : 'NO'
      }
    },
    {
      field: ATTENDANCE_DATA_GRID_ATTR.NOTE,
      headerName: 'Note',
      width: 380,
      // editable: true,
    }
  ];

  const getAttendanceDataGridRows = async () => {

    let dataGridRows = []
    let students, allAttendance, allStudentAttendance, allclassData;

    students = await db_contactPerson.getStudentsList(selectedContactPerson.key);
    allAttendance = await db_attendance.getCollection();
    allStudentAttendance = await db_studentAttendance.getCollection();
    allclassData = await db_class.getCollection();

    students.forEach(student => {
      let studentAttendancesOfThisStudent = allStudentAttendance.filter(studentAttendanceRecord => studentAttendanceRecord.data[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY] === student.key)

      studentAttendancesOfThisStudent.forEach(selectedStudentAttendance => {
        console.log(selectedStudentAttendance)
        if (!allAttendance.find(item => item.key === selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY])) {
          // break;
        } else {
          dataGridRows.push({
            id: selectedStudentAttendance.key,
            [ATTENDANCE_DATA_GRID_ATTR.STUDENT_KEY]: selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.STUDENT_KEY],
            [ATTENDANCE_DATA_GRID_ATTR.DATE_TIME]: new Date(allAttendance.find(item => item.key === selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.ATTENDANCE_KEY]).data[ATTENDANCE_ATTRIBUTES.START_DATE_TIME]),
            [ATTENDANCE_DATA_GRID_ATTR.CLASSNAME]: allAttendance.find(item => item.data[ATTENDANCE_ATTRIBUTES.CLASS_KEY] === selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.CLASS_KEY]).data[ATTENDANCE_ATTRIBUTES.CLASS_NAME],
            [ATTENDANCE_DATA_GRID_ATTR.IS_PRESENT]: selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.IS_PRESENT],
            [ATTENDANCE_DATA_GRID_ATTR.IS_LATE]: selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.IS_LATE],
            [ATTENDANCE_DATA_GRID_ATTR.NOTE]: selectedStudentAttendance.data[STUDENT_ATTENDANCE_ATTR.NOTE],
          })
        }
      })
    })

    console.log('StudentDetail : getAttendanceDataGridRows : dataGridRows :', dataGridRows)
    return dataGridRows
  }


  const AttendanceRecordSection = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    let a11yProps = (index) => {
      return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
      };
    }

    function TabPanel(props) {
      const { children, value, index, ...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box sx={{ pb: 3 }}>
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
    }

    TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    };

    let handleChangeIndex = (event, newValue) => {
      setSelectedIndex(newValue)
    }

    return (
      <>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedIndex} onChange={handleChangeIndex} aria-label="Student Name Tabs" variant="scrollable" scrollButtons="auto">
              {studentList.map((student, i) =>
                <Tab key={'name' + student.key} label={student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} {...a11yProps(i)} />
              )}
            </Tabs>
          </Box>

          {/* Iterate the dataGrid */}
          {studentList.map((student, i) => {
            // filter out the student
            let filteredRowsAttendaceRecord = rowsAttendaceRecord.filter(rec => rec[ATTENDANCE_DATA_GRID_ATTR.STUDENT_KEY] === student.key)

            return (
              <TabPanel key={student.key + i} value={selectedIndex} index={i}>
                {/* The data grid of the tuition Record */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={filteredRowsAttendaceRecord}
                    columns={columnsAttendaceRecord}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: ATTENDANCE_DATA_GRID_ATTR.DATE_TIME, sort: 'desc' }]
                      }
                    }}
                    disableSelectionOnClick
                  />
                </Box>
              </TabPanel>)
          })}
        </Box>
      </>
    )
  }

  // Tuition Record section
  const TuitionRecordSection = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    let a11yProps = (index) => {
      return {
        id: `tuitionRecord-tab-${index}`,
        'aria-controls': `tuitionRecord-tabpanel-${index}`,
      };
    }

    function TabPanel(props) {
      const { children, value, index, ...other } = props;

      return (
        <div
          role="tabpanel"
          hidden={value !== index}
          id={`tuitionRecord-tabpanel-${index}`}
          aria-labelledby={`tuitionRecord-tab-${index}`}
          {...other}
        >
          {value === index && (
            <Box sx={{ pb: 3 }}>
              <Typography>{children}</Typography>
            </Box>
          )}
        </div>
      );
    }

    TabPanel.propTypes = {
      children: PropTypes.node,
      index: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired,
    };

    let handleChangeIndex = (event, newValue) => {
      setSelectedIndex(newValue)
    }

    return (
      <>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={selectedIndex} onChange={handleChangeIndex} aria-label="Student Name for tuition record Tabs" variant="scrollable" scrollButtons="auto">
              {studentList.map((student, i) =>
                <Tab key={'name' + student.key} label={student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} {...a11yProps(i)} />
              )}
            </Tabs>
          </Box>

          {/* Iterate the dataGrid */}
          {studentList.map((student, i) => {
            // filter out the student
            let filteredRowsTuitionRecord = rowsTuitionRecord.filter(rec => rec[TUITION_RECORD_DATA_GRID_ATTR.STUDENT_KEY] === student.key)

            return (
              <TabPanel key={student.key + i} value={selectedIndex} index={i}>
                {/* The data grid of the tuition Record */}
                <Box sx={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={filteredRowsTuitionRecord}
                    columns={columnsTuitionRecord}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: TUITION_RECORD_DATA_GRID_ATTR.PAY_DATE, sort: 'desc' }]
                      }
                    }}
                    disableSelectionOnClick
                  />
                </Box>
              </TabPanel>)
          })}
        </Box>
      </>
    )
  }

  const StudentCard = ({ studentRecord, index }) => {
    let imageStyle = {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      marginRight: '10px',
    }
    return (
      <Paper
        sx={{
          width: "100%",
          padding: '10px',
        }}>
        <Grid container flex={true} alignItems={'center'} direction={'row'}>
          {/* Image */}
          <Grid items>
            {studentRecord.data[STUDENT_ATTRIBUTES.IMAGE_URI] ?
              (
                <img
                  src={studentRecord.data[STUDENT_ATTRIBUTES.IMAGE_URI]}
                  alt={`${studentRecord.data[STUDENT_ATTENDANCE_ATTR.STUDENT_NAME]} image`}
                  style={{
                    ...imageStyle
                  }}
                />
              ) : (
                <PersonIcon sx={{
                  ...imageStyle,
                  color: '#ccc'
                }} />
              )
            }
          </Grid>

          {/* Information */}
          <Grid item xs={5} >
            <Typography sx={{
              fontWeight: 700,
              fontSize: '1.2em',
              display: 'flex',
              alignItems: 'center',
            }}>{studentRecord.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} {genderMapping[studentRecord.data[STUDENT_ATTRIBUTES.GENDER]]}</Typography>
            <Typography
              sx={{
                width: 'fit-content',
                padding: '3px 6px',
                fontSize: '0.8em',
                borderRadius: '5px',
                textTransform: 'uppercase',
                fontWeight: 500,
                background: genderMappingColor[studentRecord.data[STUDENT_ATTRIBUTES.GENDER]],
                color: 'white',
              }}
            >Age: {(new Date().getFullYear()) - (studentRecord.data[STUDENT_ATTRIBUTES.BIRTH_YEAR])}</Typography>
          </Grid>

          <Grid item xs={4}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                border: '#aaa 1px solid',
                borderRadius: '5px',
                padding: '10px 3px',
                position: 'relative',
            }}
            >
            <PaidIcon sx={{
              position:'absolute',
              top: '-10px',
              left:'-10px',
              background: 'white'
              
            }} />
            <Box sx={{
              padding: '5px',
              display: 'flex',
              flexDirection:'column',
              // alignItems:'center',
            }}>
              <Typography sx={{ fontSize: '0.8em', fontWeight:'500'}}>{currency ? CURRENCY.find(item => item.shortName === currency).sign : null} {studentRecord.data[STUDENT_ATTRIBUTES.TUITION_VALUE]}</Typography>
              <Typography sx={{ fontSize: '0.8em', fontWeight:'500'}}>{studentRecord.data[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]} lesson{studentRecord.data[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]>1?'s':null}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      </Paper >
    )
}

const handleClose = () => {
  setStudentList(null);
  setIsSignleStudent(null);
  setRowsAttendaceRecord([]);
  setRowsTuitionRecord([]);
  setSelectedContactPerson(null)
}

const ImageSection = ({ index }) => (
  <>
    <div style={{
      width: '100%',
      paddingTop: '15px',
      paddingBottom: '15px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '150px',
        height: '150px',
        widht: '100%',
        borderRadius: '50%',
        overflow: 'hidden',

      }}>
        {
          studentList[index].data[STUDENT_ATTRIBUTES.IMAGE_URI]
            ? (<>
              <img
                src={studentList[index].data[STUDENT_ATTRIBUTES.IMAGE_URI]}
                alt={studentList[index].data[STUDENT_ATTRIBUTES.STUDENT_NAME]}
                style={{
                  width: '150px',
                  height: '150px',
                }}
              />

            </>)

            : <PersonIcon sx={{
              width: '150px',
              height: '150px',
              color: '#ccc'
            }} />
        }
      </div>
    </div>
  </>
)

return (
  <Dialog
    fullScreen
    open={selectedContactPerson ? true : false}
  >
    {selectedContactPerson && studentList ? (
      <>

        <SubpageHeader bgcolor='#56ba66' title="Student Detail" onclose={handleClose} textcolor="#333" />

        <Container sx={{ paddingTop: '15px' }}>

          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: '2em',
              marginBottom: '2px',
              ...commonStyle_vCenterImgText,
            }}>
            {/* ------ Single / Group -------- */}
            {isSignleStudent ? (
              <PersonIcon sx={{
                ...style_smallIcon
              }} />
            ) : (
              <GroupsIcon sx={{
                ...style_smallIcon
              }} />
            )}

            &nbsp;

            {/* ------Name------ */}
            {selectedContactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]}
            &nbsp;

            {isSignleStudent ? (
              <span style={{
                fontSize: '0.6em',
                border: '1px #333 solid',
                borderRadius: '25px',
                padding: '1px 8px',
                ...commonStyle_vCenterImgText,
              }}>
                {/* -----Gender----- */}
                {!isSignleStudent ? null : genderMapping[studentList[0].data[STUDENT_ATTRIBUTES.GENDER]]}

                {/* ------Age------ */}
                {(new Date().getFullYear()) - (studentList[0].data[STUDENT_ATTRIBUTES.BIRTH_YEAR])}
              </span>
            ) : null}

          </Typography>

          <Typography sx={{
            fontSize: '0.7em'
          }}>
            {/* createDate */}
            {`Date Created: ${moment(selectedContactPerson.data[CONTACT_PERSON_ATTRIBUTES.CREATED_DATE]).format("DD/MM/YYYY")}`}
          </Typography>

          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {isSignleStudent ? (
              // Single view
              <>

                <ImageSection index={0} />
                {[
                  { icon: <EmailIcon sx={{ ...style_listIcon }} />, content: selectedContactPerson.data[CONTACT_PERSON_ATTRIBUTES.EMAIL] }
                  , { icon: <PhoneAndroidIcon sx={{ ...style_listIcon }} />, content: selectedContactPerson.data[CONTACT_PERSON_ATTRIBUTES.PHONE] }
                  , { icon: <PaidIcon sx={{ ...style_listIcon }} />, content: `$ ${studentList[0].data[STUDENT_ATTRIBUTES.TUITION_VALUE]} ( ${studentList[0].data[STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]} lessons )` }
                ].map(item => (
                  <ListItem key={item.content}>
                    <ListItemText>
                      <Typography sx={{ ...commonStyle_vCenterImgText }}>{item.icon}{" "}{item.content}</Typography>
                    </ListItemText>
                  </ListItem>
                ))}
              </>
            ) : (
              <>
                {/* Group View */}
                {[
                  { icon: <EmailIcon sx={{ ...style_listIcon }} />, content: selectedContactPerson.data[STUDENT_ATTRIBUTES.EMAIL] }
                  , { icon: <PhoneAndroidIcon sx={{ ...style_listIcon }} />, content: selectedContactPerson.data[STUDENT_ATTRIBUTES.PHONE] }
                ].map(item => (
                  <ListItem key={item.content}>
                    <ListItemText>
                      <Typography sx={{ ...commonStyle_vCenterImgText }}>{item.icon}{" "}{item.content}</Typography>
                    </ListItemText>
                  </ListItem>
                ))}

                <Container>
                  <Stack spacing={2}>
                    {studentList.map((item, i) =>
                      <StudentCard studentRecord={item} index={i} />
                    )}
                  </Stack>
                </Container>
              </>
            )}
          </List>
        </Container>

        <Container>
          {/* Attendance Rercord */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="attendance-panel2a-content"
              id="attendance-panel2a-header"
            >
              <Typography>Attendance Record</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <AttendanceRecordSection />
            </AccordionDetails>
          </Accordion>

          {/* Tuition Rercord */}
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="tuiton-panel2a-content"
              id="tuition-panel2a-header"
            >
              <Typography>Tuition Record</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TuitionRecordSection />
            </AccordionDetails>
          </Accordion>
        </Container>
      </ >
    ) : null
    }
  </Dialog >
);
}
