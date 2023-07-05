import React, { useEffect, useState } from 'react'

import { CollectionStudentAPI, STUDENT_ATTRIBUTES } from '../../api/CollectionStudentAPI'
import { CollectionContactPersonAPI, CONTACT_PERSON_ATTRIBUTES } from '../../api/CollectionContactPersonAPI';

import { StudentDetail } from '../StudentDetail'
import { StudentCreateForm } from '../StudentCreateForm'

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import { Autocomplete, Box, Button, IconButton, Paper, TextField, Typography, CircularProgress } from '@mui/material'
import WidgetFrame from '../WidgetFrame';

function WidgetStudent() {
    const db_student = new CollectionStudentAPI;
    const db_contactPerson = new CollectionContactPersonAPI();

    const [allStudentsRecord, setAllStudentsRecord] = useState([]);
    const [allContactPerson, setAllContactPerson] = useState([]);

    const [studentOptionForSearchBar, setStudentOptionForSearchBar] = useState([]);
    const [didCreateSearchBarOption, setDidCreateSearchBarOption] = useState(false);
    const [isOpenSearchBarOption, setIsOpenSearchBarOption] = useState(false);
    const [searchBarText, setSearchBarText] = useState('')

    const [studentDetailContactPerson, setStudentDetailContactPerson] = useState(null);

    const [isOpenStudentCreateForm, setIsOpenStudentCreateForm] = useState(false);

    const [refresh, setRefresh] = useState(false)

    useEffect(() => {
        let tempOption = [];
        db_contactPerson.getCollection().then(allContactPerson => {
            if (allContactPerson && allContactPerson.length > 0) {  // ensure there are contact person records.

                setAllContactPerson(allContactPerson);

                db_student.getCollection().then(allStudent => {
                    setAllStudentsRecord(allStudent)

                    allContactPerson.forEach((_contactPerson) => {
                        // Add the contact person to option first
                        tempOption.push({
                            name: _contactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME],
                            key: _contactPerson.key,
                        })

                        // check the contact has any other student (single/group)
                        let filteredStudentList = allStudent.filter(_student => _student.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === _contactPerson.key)
                        let isOnlyOneStudent = filteredStudentList.length === 1;
                        let isTheStudentHasSameName = isOnlyOneStudent && (_contactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME] === filteredStudentList[0].data[STUDENT_ATTRIBUTES.STUDENT_NAME])

                        if (!isOnlyOneStudent || !isTheStudentHasSameName) {
                            filteredStudentList.forEach(_filteredStudent => {
                                tempOption.push({
                                    name: _filteredStudent.data[STUDENT_ATTRIBUTES.STUDENT_NAME],
                                    key: _contactPerson.key,
                                })
                            })

                        }
                    })

                })
            }
            setStudentOptionForSearchBar(tempOption);
            setDidCreateSearchBarOption(true);
        })
    }, [refresh])

    const iconBtnStyle = {
        border: '2px #2A4359 solid',
        marginLeft: '5px',
        marginRight: '5px',
    }

    const iconBtnCaptionStyle = {
        paddingTop: '3px',
        fontSize: '0.5em',
        fontWeight: 700,
    }

    const flex = {
        display: 'flex',

    }

    const flexColumnCenterCenter = {
        ...flex,
        flexDirection: "column",
        justifyContent: 'center',
        alignItems: 'center'
    }


    const handleChange = (e, value) => {
        setStudentDetailContactPerson(allContactPerson.find(item => item.key === value.key))
    }

    const handleAddBtn = (e) => {
        setIsOpenStudentCreateForm(true)
    }


    return (
        <>
            {/* Student detail component */}
            <StudentDetail selectedContactPerson={studentDetailContactPerson} setSelectedContactPerson={setStudentDetailContactPerson} />

            {/* Student Create Form */}
            <StudentCreateForm isShow={isOpenStudentCreateForm} setIsShow={setIsOpenStudentCreateForm} refresh={refresh} setRefresh={setRefresh} />

            <WidgetFrame background='#F2C53D22' titleText='STUDENT' >
                {
                    studentOptionForSearchBar && didCreateSearchBarOption ?
                        <Box>
                            <Autocomplete
                                freeSolo
                                id="searchBar"
                                disableClearable
                                onOpen={() => setIsOpenSearchBarOption(true)}
                                onClose={(() => setIsOpenSearchBarOption(false))}
                                inputValue={searchBarText}
                                onInputChange={(e, newValue) => setSearchBarText(newValue)}
                                onChange={handleChange}
                                options={[...studentOptionForSearchBar]}
                                getOptionLabel={(option) => option.name}
                                loading={!didCreateSearchBarOption}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search student"
                                        InputProps={{
                                            ...params.InputProps,
                                            type: 'search',

                                            endAdornment: (
                                                <React.Fragment>
                                                    {!didCreateSearchBarOption ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Box>
                        : null
                }


                {/* student functions shortcut */}
                <Box id='studentShortcut' sx={{ paddingTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    {/* <Box id='addStudnetBtn' sx={{ ...flexColumnCenterCenter }}>
                    <IconButton sx={iconBtnStyle} color="primary" aria-label="search students" onClick={handleSearch}>
                        <SearchIcon />
                    </IconButton>
                    <Typography sx={iconBtnCaptionStyle}>SEARCH</Typography>
                </Box> */}

                    <Box id='addStudnetBtn' sx={{ ...flexColumnCenterCenter }}>
                        <IconButton sx={iconBtnStyle} color="primary" aria-label="add new student shortcut" onClick={handleAddBtn}>
                            <AddIcon htmlColor='#2A4359' />
                        </IconButton>
                        <Typography sx={iconBtnCaptionStyle}>ADD</Typography>
                    </Box>
                </Box>

            </WidgetFrame>
        </>
    )
}

export default WidgetStudent