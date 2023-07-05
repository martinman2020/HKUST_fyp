import {
    TextField
    , FormControl
    , Box
    , Button
    , MenuItem
    , Select
    , InputLabel
    , Grid
    , Snackbar
    , Alert
    , Tabs
    , Tab
    , Typography
    , ToggleButton
    , ToggleButtonGroup
    , InputAdornment,
    Dialog,
    IconButton,
    Container
} from '@mui/material';

import AddBoxIcon from '@mui/icons-material/AddBox';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import PropTypes from 'prop-types';

import { React, useEffect, useState, useReducer } from 'react'

import { CollectionStudentAPI, GENDER, STUDENT_ATTRIBUTES, STUDENT_STATE } from '../../api/CollectionStudentAPI'
import { CollectionTuitionSetAPI, TUITION_SET_ATTRIBUTES } from '../../api/CollectionTuitionSetAPI'
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI'
import { commonStyle_centeredBoxOnTheTopest } from '../commonStyle';
import { CURRENCY } from '../../preset/preference';
import { CollectionTuitionRecordAPI } from '../../api/CollectionTuitionRecordAPI';
import { CollectionContactPersonAPI, CONTACT_PERSON_ATTRIBUTES, CONTACT_PERSON_STATE } from '../../api/CollectionContactPersonAPI';
import { CollectionStudentAttendanceAPI } from '../../api/CollectionStudentAttendanceAPI';
import { CollectionClassAPI } from '../../api/CollectionClassAPI';
import CameraModule from '../CameraModule';
import PopupDialogFrame from '../PopupDialogFrame'
import convertBase64 from '../../common/convertBase64';
import resizeImage from '../../common/resizeImage';


const FORM_ACTION = {
    INIT: 'initilization',
    CHANGE_FORM_VALUE: 'changeValue',
    CHANGE_STUDENT_VALUE: ' Value',
    WIPE_DATA: 'wipeData',
    SUBMIT: 'submit'
}

const CUSTOMIZE_TUITION = 'customize'

const FORM_MODE = {
    SINGLE: 'single',
    PARENT: 'parent'
}


export function StudentCreateForm({ isShow, setIsShow, targetStudent, setTargetStudent, refresh, setRefresh }) {
    const db_tuitionSet = new CollectionTuitionSetAPI();
    const db_student = new CollectionStudentAPI();
    const db_contactPerson = new CollectionContactPersonAPI();
    const db_preference = new CollectionPreferenceAPI();
    const db_tuitionRecord = new CollectionTuitionRecordAPI();
    const db_studentAttendance = new CollectionStudentAttendanceAPI();
    const db_class = new CollectionClassAPI();

    const [isCreateMode, setIsCreateMode] = useState(targetStudent ? false : true)
    const [formMode, setFormMode] = useState(targetStudent ? (db_contactPerson.isSingleStudent(targetStudent) ? FORM_MODE.SINGLE : FORM_MODE.PARENT) : FORM_MODE.SINGLE)
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [tuitionSet, setTuitionSet] = useState();
    const [isCustomizeTuition, setIsCustomizeTuition] = useState(false);
    const [emailList, setEmailList] = useState([])
    const [currency, setCurrency] = useState(null);

    // FOR CAMERA
    const [isOpenCamera, setIsOpenCamera] = useState(false);
    const [imageUri, setImageUri] = useState(null);

    const initContactPerson = {
        [CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]: '',
        [CONTACT_PERSON_ATTRIBUTES.EMAIL]: '',
        [CONTACT_PERSON_ATTRIBUTES.PHONE]: '',
        [CONTACT_PERSON_ATTRIBUTES.STATE]: CONTACT_PERSON_STATE.NORMAL
    }

    const initStudent = {
        key: null,
        [STUDENT_ATTRIBUTES.STUDENT_NAME]: '',
        [STUDENT_ATTRIBUTES.GENDER]: GENDER.MALE,
        [STUDENT_ATTRIBUTES.BIRTH_YEAR]: '',
        [STUDENT_ATTRIBUTES.TUITION_VALUE]: '',
        [STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]: '',
        [STUDENT_ATTRIBUTES.IMAGE_URI]: null,
        [STUDENT_ATTRIBUTES.STATE]: CONTACT_PERSON_STATE.NORMAL,
    }

    const setCurrentStudentAttr = async (attributesObj) => {
        if (studentsFormList && studentsFormList.length > 0) {
            setStudentsFormList(studentsFormList.map((rec, index) =>
                index === selectedStudentIndex ? { ...rec, ...attributesObj } : { ...rec }
            ))
        }
    }

    const setCurrentStudentTuition = (tuitionValue, amountOfLesson) => {
        setCurrentStudentAttr({
            [STUDENT_ATTRIBUTES.TUITION_VALUE]: tuitionValue,
            [STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]: amountOfLesson
        })
    }

    const [contactPersonFormData, setContactPersonFormData] = useState()

    const [studentsFormList, setStudentsFormList] = useState([]);
    const [studentsFromListBefore, setStudentFromListBefore] = useState([]);

    const [selectedTuitionObj, setSelectedTuitionObj] = useState();

    const getSelctedStudentTuitionSet = (flattenStudentArr) => {
        // get the selected students tuition set
        let price = flattenStudentArr ? flattenStudentArr[selectedStudentIndex][STUDENT_ATTRIBUTES.TUITION_VALUE] : (studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.TUITION_VALUE] : 0)
        let amountOfLesson = flattenStudentArr ? flattenStudentArr[selectedStudentIndex][STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS] : (studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS] : 0)
        let set = tuitionSet.find(item => item.data[TUITION_SET_ATTRIBUTES.PRICE] === price && item.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS])

        if (set === undefined) {
            setSelectedTuitionObj({
                key: CUSTOMIZE_TUITION,
                data: {
                    [TUITION_SET_ATTRIBUTES.NAME]: CUSTOMIZE_TUITION,
                    [TUITION_SET_ATTRIBUTES.PRICE]: price,
                    [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: amountOfLesson
                }
            })
            setIsCustomizeTuition(true)
        } else {
            setSelectedTuitionObj(set)
            setIsCustomizeTuition(false)
        }
    }

    const getSelectedStudentImageUri = () => {
        let data = studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.IMAGE_URI] : null
        setImageUri(data)
    }

    const ImageDisplay = () => (
        <>
            <Container sx={{ position: 'relative' }}>
                <Box sx={{ position: 'absolute', right: '10%', top: '5%' }}>
                    <IconButton sx={{ background: '#c45151' }} onClick={() => setImageUri(null)}>
                        <DeleteIcon sx={{ color: '#eee' }} />
                    </IconButton>
                </Box>
                <Box sx={{
                    display: 'flex'
                    , justifyContent: 'center'
                    , alignItems: 'center'
                    , marginTop: '10px'
                    , marginBottom: '10px'
                    , borderRadius: '10px'
                    , overflow: 'hidden'
                }}>
                    <img style={{ width: '100%', maxWidth: '360px' }} src={imageUri} alt='user' />
                </Box>
            </Container>
        </>
    )



    // While the component is loaded
    useEffect(() => {
        db_tuitionSet.getCollection().then(result => setTuitionSet(result));

        db_tuitionSet.getCollection().then(result => setTuitionSet(result));

        db_preference.getCurrency().then(item => setCurrency(item))
    }, [])


    useEffect(() => {
        setSelectedStudentIndex(0)
        if (isShow === true) {
            // Fetch the tutionSet list 
            db_tuitionSet.getCollection().then(result => setTuitionSet(result));

            db_tuitionSet.getCollection().then(result => setTuitionSet(result));

            db_preference.getCurrency().then(item => setCurrency(item))

            // get the email list for comparing
            db_contactPerson.getCollection(false).then(res => {
                // console.log(res)
                let temp_emailList = res.map(contactPerson => contactPerson[CONTACT_PERSON_ATTRIBUTES.EMAIL]);
                setEmailList(temp_emailList)
            })

            setIsCreateMode(targetStudent ? false : true)
            if (targetStudent) {    // EDIT MODE
                db_contactPerson.isSingleStudent(targetStudent).then(res => {
                    setFormMode(res ? FORM_MODE.SINGLE : FORM_MODE.PARENT)
                })

                setContactPersonFormData(targetStudent.data)
                db_contactPerson.getStudentsList(targetStudent.key).then(result => {
                    let flattenStudents = result.map(student => ({ ...student.data, key: student.key }));
                    setStudentsFormList(flattenStudents)
                    setStudentFromListBefore(flattenStudents)
                    getSelctedStudentTuitionSet(flattenStudents);

                    if (result[selectedStudentIndex].data[STUDENT_ATTRIBUTES.IMAGE_URI]) {
                        setImageUri(result[selectedStudentIndex].data[STUDENT_ATTRIBUTES.IMAGE_URI])
                    } else {
                        setImageUri(null)
                    }
                })

            } else {  // CREATE MODE
                // if there are no tuitionSet
                if (tuitionSet && tuitionSet.length > 0) {
                    setImageUri(null)
                    setIsCustomizeTuition(false)
                    setSelectedTuitionObj(tuitionSet[0])
                    setCurrentStudentTuition(tuitionSet[0].data[TUITION_SET_ATTRIBUTES.PRICE], tuitionSet[0].data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS])
                } else {
                    setSelectedTuitionObj({
                        key: CUSTOMIZE_TUITION,
                        data: {
                            [TUITION_SET_ATTRIBUTES.NAME]: CUSTOMIZE_TUITION,
                            [TUITION_SET_ATTRIBUTES.PRICE]: 1000,
                            [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: 4
                        }
                    })
                    setIsCustomizeTuition(true)
                }
            }
        }
        // set the targetStudent nomatter create or edit mode
        if (isShow === false) {
            setFormMode(FORM_MODE.SINGLE)
            setContactPersonFormData(initContactPerson)
            setStudentsFormList([initStudent])
            if (targetStudent && setTargetStudent) {
                setTargetStudent(null)
            }
        }
    }, [isShow])

    useEffect(() => {
        if (isCreateMode) {
            // work only in create mode
            if (contactPersonFormData && studentsFormList && selectedTuitionObj) {
                if (formMode === FORM_MODE.SINGLE) {
                    let contactPersonName = contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME];
                    console.log('selectedTuitionObj,',selectedTuitionObj)
                    setStudentsFormList([{
                        ...studentsFormList[0]
                        , [STUDENT_ATTRIBUTES.STUDENT_NAME]: contactPersonName
                        , [STUDENT_ATTRIBUTES.TUITION_VALUE]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE]
                        , [STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]
                    }])

                } else {

                    setStudentsFormList([{
                        ...studentsFormList[0]
                        , [STUDENT_ATTRIBUTES.STUDENT_NAME]: 'New Student'
                        , [STUDENT_ATTRIBUTES.TUITION_VALUE]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE]
                        , [STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]
                    }])
                }
            }
        }
    }, [formMode])

    useEffect(() => {
        if (selectedTuitionObj !== undefined) {
            setCurrentStudentTuition(selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE], selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS])
        }
    }, [selectedTuitionObj])

    useEffect(() => {
        setCurrentStudentAttr({ [STUDENT_ATTRIBUTES.IMAGE_URI]: imageUri })
    }, [imageUri])


    const toggleFormMode = (event, mode) => {
        if (mode !== null) {
            setFormMode(mode)
        }
    }

    const handleSelectTuition = (key) => {
        if (key === CUSTOMIZE_TUITION) {
            console.log('customized tuition selected')
            setIsCustomizeTuition(true);
            setSelectedTuitionObj({
                key: CUSTOMIZE_TUITION,
                data: {
                    [TUITION_SET_ATTRIBUTES.NAME]: CUSTOMIZE_TUITION,
                    [TUITION_SET_ATTRIBUTES.PRICE]: '100',
                    [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: '1'
                }
            })
        } else {
            console.log('preset tuition selected')
            setIsCustomizeTuition(false);
            let tuition = tuitionSet.find(item => item.key === key);
            setSelectedTuitionObj(tuition);
        }
    }

    const ListTuitionSet = () => (
        (tuitionSet === undefined || selectedTuitionObj === undefined) ? // If the tuition set is empty
            <div>Loading..</div> :   // show loading
            // else show the select form
            <>
                <FormControl fullWidth>
                    <InputLabel id="tuitionSet">Tuition</InputLabel>
                    <Select
                        labelId="tuitionSet-select"
                        id="tuitionSet-select"
                        defaultValue={selectedTuitionObj.key}
                        label="Tuition"
                        onChange={(e) => { handleSelectTuition(e.target.value) }}
                    >
                        {tuitionSet.map(item =>
                            <MenuItem key={item.key} value={item.key}>{item.data[TUITION_SET_ATTRIBUTES.NAME]} {CURRENCY.filter(item => item.shortName === currency)[0].sign} {item.data[TUITION_SET_ATTRIBUTES.PRICE]} ({item.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]} lesson)</MenuItem>
                        )}
                        <MenuItem
                            value={CUSTOMIZE_TUITION}
                        >Customized Tuition: {selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE]} ({selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]} lesson)</MenuItem>

                    </Select>
                </FormControl>
            </>
    )


    const handleFileRead = async (event) => {
        const file = event.target.files[0]
        console.log(file);
        // const base64 = await resizeImage(file)
        resizeImage(file).then(res=>{
            setImageUri(res)
            console.log(res)
        })
        // setImageUri(base64)
    }

    const UploadImageButton = () => (
        <IconButton
            component="label"
            onChange={handleFileRead}
            sx={{ width: '40px', height: '40px', border: '1px solid #aaa' }}
        >
            <AddPhotoAlternateIcon />
            <input
                accept="image/*"
                type="file"
                hidden
            />
        </IconButton>
    )

    const CameraButton = () => (
        <IconButton
            onClick={() => setIsOpenCamera(true)}
            sx={{ width: '40px', height: '40px', border: '1px solid #aaa' }}>
            <CameraAltIcon />
        </IconButton>
    )



    // for Tabs while parent has mutiple student
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
                    <Box sx={{ p: 3 }}>
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

    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    const handleSelectedStudentIndexChange = (event, newValue) => {
        setSelectedStudentIndex(newValue);
    };

    useEffect(() => {
        if (tuitionSet && selectedTuitionObj && contactPersonFormData && studentsFormList) {
            getSelctedStudentTuitionSet();
            getSelectedStudentImageUri()
        }
    }, [selectedStudentIndex])

    // Swap this function to the end of the process. 
    const handleChangeContactName = (value) => {
        if (formMode === FORM_MODE.SINGLE) {
            // If this is a single student, set contact name and student name with targeted 
            let temp_studentForm = studentsFormList
            temp_studentForm[0][STUDENT_ATTRIBUTES.STUDENT_NAME] = contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]
            setStudentsFormList(temp_studentForm)
        }
        setContactPersonFormData({ ...contactPersonFormData, [CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]: value })
    }

    // Swap the formData to studentList
    const handleRemoveStudent = (index) => {
        // TODO: if it is a update form, create a confirm dialog to let user confirm the deletion.
        if (studentsFormList.length > 1) {
            if (selectedStudentIndex !== 0) {
                setSelectedStudentIndex(selectedStudentIndex - 1);
            }

            //--- remove student from list
            setStudentsFormList(studentsFormList.filter((item, i) => index !== i));

        } else {
            console.log('You have to remain 1 student')
        }
    }

    const handleAddStudent = () => {
        let temp_studentList = studentsFormList;

        temp_studentList.push({
            ...initStudent,
            [STUDENT_ATTRIBUTES.STUDENT_NAME]: `New Student ${temp_studentList.length + 1}`,
            [STUDENT_ATTRIBUTES.TUITION_VALUE]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE],
            [STUDENT_ATTRIBUTES.AMOUNT_OF_LESSONS]: selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS],
        })

        setStudentsFormList(temp_studentList)
        setSelectedStudentIndex(temp_studentList.length - 1)
    }

    const [isRepeatEmail, setIsRepeatEmail] = useState(false);
    const handleEmailCheck = (email) => {
        setContactPersonFormData({ ...contactPersonFormData, [CONTACT_PERSON_ATTRIBUTES.EMAIL]: email })
        if (emailList.includes(email)) {
            if (targetStudent && email === targetStudent.data[STUDENT_ATTRIBUTES.EMAIL]) {
                setIsRepeatEmail(false)
            } else {
                setIsRepeatEmail(true)
            }
        } else {
            setIsRepeatEmail(false)
        }
    }

    //  Handle Submit
    const [isSubmited, setIsSubmited] = useState(false)
    const [submittedMsg, setSubmittedMsg] = useState('')

    const removeKeyfromFlattenStudentObject = (studentObject) => {  // 
        let temp = studentObject;
        delete temp.key;
        return temp;
    }

    const [formShowError,setFormShowError] = useState({
        studentName: false,
        contactName: false,
    })

    const formErrorMsg = {
        studentName: 'Please enter the student name.',
        contactName: 'Please enter the contact person name.'
    }

    const ErrorMsg = ({text})=>(
    <Typography component={"p"} sx={{fontSize: '0.8em', color: 'red'}}>{text}</Typography>
    )

    const validateForm = () =>{
        let allTrue = true;

        // contact name validate
        if(contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME].trim() === ''){
            setFormShowError({...formShowError, contactName: true})
            console.log('ERROR')
            allTrue = false
        }else{
            setFormShowError({...formShowError, contactName: false})
        }

        // students validate
        if(formMode === FORM_MODE.PARENT){
            for(let i = 0; i < studentsFormList.length; i++){
                if(studentsFormList[i][STUDENT_ATTRIBUTES.STUDENT_NAME].trim() === ''){
                    setSelectedStudentIndex(i)
                    setFormShowError({...formShowError, studentName: true})
                    allTrue = false
                    break
                }

                setFormShowError({...formShowError, studentName: false})
            }
        }

        return allTrue
    }

    const handleSubmit = () => {
        // Validate the form data.
        if(validateForm() === false){
            return
        }
        if (isSubmited === false) {
            db_contactPerson.addDocument({
                [CONTACT_PERSON_ATTRIBUTES.STATE]: STUDENT_STATE.NORMAL,
                [CONTACT_PERSON_ATTRIBUTES.CREATED_DATE]: new Date(),
                ...contactPersonFormData,
            }).then(res => {

                studentsFormList.forEach(student => {
                    let studentName = (formMode === FORM_MODE.SINGLE ? { [STUDENT_ATTRIBUTES.STUDENT_NAME]: contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME] } : {});

                    db_student.addDocument(removeKeyfromFlattenStudentObject({
                        ...student,
                        ...studentName,
                        [STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY]: res.data.key,
                        [STUDENT_ATTRIBUTES.CREATED_DATE]: new Date(),
                        [STUDENT_ATTRIBUTES.STATE]: STUDENT_STATE.NORMAL
                    }))
                })

                // console.log(res.data);
                if (res !== undefined) {
                    setSubmittedMsg('Student has been added');
                    setIsSubmited(true);
                    setIsShow(false);
                    setRefresh(!refresh);
                }

            })
        }
    }



    const handleUpdate = () => {
        setIsSubmited(false);

        const contactPersonFormForUpdate = contactPersonFormData
        const flattenStudentListForUpdate = formMode === FORM_MODE.SINGLE ? [studentsFormList[0]] : studentsFormList

        if (formMode === FORM_MODE.SINGLE) {
            flattenStudentListForUpdate[0][STUDENT_ATTRIBUTES.STUDENT_NAME] = contactPersonFormForUpdate[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]
        }

        // Handle the DELETED student by filtering the missing part from the lastest list. 
        // To compare the modified version, and find out which student was deleted during the operation
        const studentKeysBeforeArr = studentsFromListBefore.map(item => item.key)
        const studentKeysAfterArr = flattenStudentListForUpdate.filter(item => item.key).map(item => item.key)
        const deletedStudentKeys = studentKeysBeforeArr.filter(item => !studentKeysAfterArr.includes(item));  // compare and get the missing key
        console.log("deletedStudentKeys", deletedStudentKeys)   // ****DEBUG***
        deletedStudentKeys.forEach(async studentKey => {
            db_tuitionRecord.deleteRecordByStudentKey(studentKey)
                .then(res => db_studentAttendance.deleteRecordsByStudentKey(studentKey)
                    .then(res2 => db_class.removeStudentfromAllClassByStudentKey(studentKey)
                        .then(res3 => db_student.deleteDocument(studentKey))
                    ))
        })  // execution of deleting 

        // Handle the new added student by filtering the student have key === null
        const addedStudentObjectArray = flattenStudentListForUpdate.filter(studentObj => !studentObj.key);
        const addedStudentObjectArrayWithoutKey = addedStudentObjectArray.map(studentObj => { delete studentObj.key; return { ...studentObj, [STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY]: targetStudent.key } })
        console.log('array of execution of adding ', addedStudentObjectArrayWithoutKey)// ****DEBUG***
        addedStudentObjectArrayWithoutKey.forEach(async item => await db_student.addDocument(item)) // execution of adding 

        // Handle the remained and modified record
        const modifiedStudentObjectArray = flattenStudentListForUpdate.filter(studentObj => studentObj.key);

        modifiedStudentObjectArray.forEach(async flattenStudentObject => await db_student.overwriteDocument(flattenStudentObject.key, removeKeyfromFlattenStudentObject(flattenStudentObject)))

        // Overwrite the contact person to database
        db_contactPerson.overwriteDocument(targetStudent.key, contactPersonFormForUpdate).then(() => {
            // Show the message 
            setSubmittedMsg('Student has been updated');
            setIsSubmited(true);
            setIsShow(false);
            setRefresh(!refresh);
        })



        // console.log("studentKeysBeforeArr", studentKeysBeforeArr)
        // console.log("studentKeysAfterArr", studentKeysAfterArr)
        // console.log("addedStudentObjectArray", addedStudentObjectArray)
        // console.log("modifiedStudentObjectArray", modifiedStudentObjectArray)

        // console.log("contactPersonFormForUpdate,", contactPersonFormForUpdate)
        // console.log("flattenStudentListForUpdate,", flattenStudentListForUpdate)
    }

    const handleClose = () => {
        // setFormMode(FORM_MODE.PARENT)
        // setSelectedStudentIndex(0)
        // setImageUri(null)
        // setIsOpenCamera(false)
        // setContactPersonFormData(null);
        // setStudentsFormList([])
        setIsShow(false)
    }

    /**
     *  ----------- Render --------------
     */
    return (
        <>
            {/* The alert that after create a student record */}
            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={isSubmited} autoHideDuration={5000} onClose={() => setIsSubmited(false)}>
                <Alert onClose={() => setIsSubmited(false)} severity="success" sx={{ width: '100%' }}>
                    {submittedMsg}
                </Alert>
            </Snackbar>

            {/* The camera section for the icon of student */}
            <Dialog
                fullScreen
                open={isOpenCamera ? true : false}
            >
                <CameraModule isOpen={isOpenCamera} setIsOpen={setIsOpenCamera} dataUri={imageUri} setDataUri={setImageUri} />
            </Dialog>

            {/* Main container of the create/updata form  */}
            {contactPersonFormData ? (
                <PopupDialogFrame
                    isOpen={isShow}
                    onClose={handleClose}
                    title={`STUDENT ${targetStudent ? 'EDIT' : 'CREATE'} FORM`}
                    onSubmit={isCreateMode ? handleSubmit : handleUpdate}
                    submitBtnText={isCreateMode ? "Submit" : 'Update'}
                >

                    <Box>
                        <Grid container spacing={2}>

                            {/* <Grid item xs={12}>
                                <Typography variant='h6' component='h2'>STUDENT {targetStudent ? 'EDIT' : 'CREATE'} FORM</Typography>
                            </Grid> */}

                            {/* The Single/Group Mode form toggle button set */}
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <ToggleButtonGroup
                                    color="primary"
                                    value={formMode}
                                    exclusive
                                    aria-label="single or group mode"
                                    onChange={toggleFormMode}
                                >
                                    <ToggleButton value={FORM_MODE.SINGLE}><PersonIcon /></ToggleButton>
                                    <ToggleButton value={FORM_MODE.PARENT}><GroupsIcon /></ToggleButton>
                                    <ToggleButton disabled sx={{
                                        textTransform: 'none',
                                        fontWeight: 700,
                                    }}>{formMode === FORM_MODE.SINGLE ? 'Single': 'Group'} type student</ToggleButton>

                                </ToggleButtonGroup>


                            </Grid>

                            {formMode === FORM_MODE.SINGLE && imageUri ? (
                                <ImageDisplay />
                            ) : null}

                            <Grid item xs={12}>
                                {
                                    formMode === FORM_MODE.SINGLE ?
                                        <Box sx={{ '&>*': { marginRight: '20px' } }}>
                                            <CameraButton /> <UploadImageButton />
                                        </Box> : null
                                }
                            </Grid>


                            {/* Contact Name Field */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id={STUDENT_ATTRIBUTES.CONTACT_NAME}
                                    label={(formMode === FORM_MODE.SINGLE ? 'Student Name' : 'Contact Name')}
                                    value={contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]}
                                    onChange={e => handleChangeContactName(e.target.value)}
                                    autoFocus
                                />
                                {formShowError['contactName']? <ErrorMsg text={formMode === FORM_MODE.SINGLE ? formErrorMsg.studentName : formErrorMsg.contactName} /> : null}
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id={STUDENT_ATTRIBUTES.PHONE}
                                    label='Phone'
                                    value={contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.PHONE]}
                                    onChange={e => setContactPersonFormData({ ...contactPersonFormData, [CONTACT_PERSON_ATTRIBUTES.PHONE]: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    error={isRepeatEmail}
                                    helperText={isRepeatEmail ? 'This email is existed, please use other email' : null}
                                    id={STUDENT_ATTRIBUTES.EMAIL}
                                    label='Email'
                                    value={contactPersonFormData[CONTACT_PERSON_ATTRIBUTES.EMAIL]}
                                    onChange={e => handleEmailCheck(e.target.value)}
                                />
                            </Grid>

                            {/* For Parent Mode */}
                            {/* The Tab panal for selecting students */}
                            {formMode === FORM_MODE.PARENT ? (
                                <Grid item xs={12}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <Tabs
                                            value={selectedStudentIndex}
                                            variant="scrollable"
                                            onChange={handleSelectedStudentIndexChange}
                                            scrollButtons="auto"
                                            aria-label="scrollable auto tabs example">
                                            {/* iterate the studentList for the tab */}
                                            {studentsFormList.map((student, index) => (
                                                <Tab
                                                    key={student[STUDENT_ATTRIBUTES.STUDENT_NAME] + index}
                                                    label={<span style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>{
                                                            student[STUDENT_ATTRIBUTES.STUDENT_NAME] + '   '}
                                                        {/* <IconButton size="small" onClick={(e) => {
                                                            handleRemoveStudent(index)
                                                        }}> */}
                                                        <DeleteIcon onClick={() => { handleRemoveStudent(index) }} />
                                                        {/* </IconButton> */}
                                                    </span>}
                                                    {...a11yProps(index)} />
                                            ))}
                                            <Tab label={<AddBoxIcon />} {...a11yProps(0)} onClick={e => handleAddStudent()} />

                                        </Tabs>
                                    </Box>

                                </Grid>
                            ) : null}



                            <>
                                {/* If it is mutiple student, shows the student name form */}
                                {formMode === FORM_MODE.PARENT
                                    ? (
                                        <>
                                            {imageUri ? (
                                                <Grid item sx={12}>
                                                    <ImageDisplay />
                                                </Grid>
                                            ) : null}

                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth
                                                    id={STUDENT_ATTRIBUTES.STUDENT_NAME}
                                                    label='Student Name'
                                                    value={studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.STUDENT_NAME] : ''}
                                                    onChange={e => setCurrentStudentAttr({ [STUDENT_ATTRIBUTES.STUDENT_NAME]: e.target.value })}
                                                />
                                                {formShowError['studentName']? <ErrorMsg text={formErrorMsg.studentName} /> :null}
                                            </Grid>


                                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', "&>*": { marginLeft: '20px' } }}>
                                                <CameraButton />
                                                <UploadImageButton />
                                            </Grid>
                                        </>
                                    ) : null}



                                {/* For single Student Mode*/}
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        id={STUDENT_ATTRIBUTES.BIRTH_YEAR}
                                        label='Birth Year'
                                        value={studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.BIRTH_YEAR] : ''}
                                        onChange={e => setCurrentStudentAttr({ [STUDENT_ATTRIBUTES.BIRTH_YEAR]: e.target.value })}
                                    />
                                </Grid>

                                <Grid item xs={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="form-gender-label">Gender</InputLabel>
                                        <Select
                                            labelId="form-gender-label"
                                            id="form-gender-select"
                                            value={studentsFormList[selectedStudentIndex] ? studentsFormList[selectedStudentIndex][STUDENT_ATTRIBUTES.GENDER] : ''}
                                            label="Gender"
                                            onChange={e => { setCurrentStudentAttr({ [STUDENT_ATTRIBUTES.GENDER]: e.target.value }) }}
                                        >
                                            <MenuItem value={GENDER.FEMALE}>Female</MenuItem>
                                            <MenuItem value={GENDER.MALE}>Male</MenuItem>
                                            <MenuItem value={GENDER.NONE}>None</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>

                            <Grid item xs={12}>
                                <ListTuitionSet />
                            </Grid>

                            {/* If the user selected customize, then the customize form popup */}
                            {isCustomizeTuition && selectedTuitionObj ? (
                                <>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            id={STUDENT_ATTRIBUTES.PRICE}
                                            label='Customized tuition '
                                            type="number"
                                            value={selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.PRICE]}

                                            onChange={e => setSelectedTuitionObj({ key: CUSTOMIZE_TUITION, data: { ...selectedTuitionObj.data, [TUITION_SET_ATTRIBUTES.PRICE]: e.target.value } })}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        $
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        for
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            id={STUDENT_ATTRIBUTES.PRICE}
                                            label='how many'
                                            type="number"
                                            value={selectedTuitionObj.data[TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]}
                                            onChange={e => setSelectedTuitionObj({ key: CUSTOMIZE_TUITION, data: { ...selectedTuitionObj.data, [TUITION_SET_ATTRIBUTES.AMOUNT_OF_LESSONS]: e.target.value } })}
                                            InputProps={{
                                                // startAdornment: (
                                                //     <InputAdornment position="start">
                                                //         for
                                                //     </InputAdornment>
                                                // ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        lessons
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </>
                            ) : null}

                        </Grid>
                    </Box>
                </PopupDialogFrame>
                // </Dialog>
            )
                : null
            }
        </>
    )
}