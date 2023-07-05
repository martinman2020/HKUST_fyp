import React, { useEffect, useState } from 'react'
import { CollectionStudentAPI, STUDENT_ATTRIBUTES, GENDER, STUDENT_STATE } from '../../api/CollectionStudentAPI'
import { CollectionContactPersonAPI, CONTACT_PERSON_ATTRIBUTES, CONTACT_PERSON_STATE } from '../../api/CollectionContactPersonAPI'
import { Button, Grid, Paper, Stack, styled, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Avatar, AvatarGroup, Typography, Container, Accordion, AccordionSummary, AccordionDetails, TextField, FormControl, InputLabel, Select, MenuItem, Menu, IconButton, ButtonBase } from '@mui/material';
import { btnBgColors, commonStyle_CenterImgText } from '../commonStyle';

import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PageviewIcon from '@mui/icons-material/Pageview';
import SortIcon from '@mui/icons-material/Sort'
import { StudentCreateForm } from '../StudentCreateForm';
import { StudentDetail } from '../StudentDetail';
import { bgcolor } from '@mui/system';
import moment from 'moment';


export function StudentList({ refreshAttr, setRefreshAttr }) {

    const db_students = new CollectionStudentAPI();
    const db_contactPerson = new CollectionContactPersonAPI();

    const [contactPersons, setContactPersons] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [isOpenCreateForm, setIsOpenCreateForm] = useState(false);
    const [hiddenStudentExpanded, setHiddenStudentExpanded] = useState(false);
    const [availableStudentExpanded, setAvailableStudentExpanded] = useState(true);

    const getData = () => {
        db_contactPerson.getCollection().then(contactPersonResult => {
            console.log('StudentList : getData : contactPersonResult', contactPersonResult)
            setContactPersons(contactPersonResult)

            db_students.getCollection().then(studentResult => {
                setStudentsList(studentResult)
            });
        });
    }

    const isSingleStudent = (contactPerson) => {
        let studentsUnderThisPerson = studentsList.filter(student => student.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === contactPerson.key);
        return (studentsUnderThisPerson.length === 1 && studentsUnderThisPerson[0].data[STUDENT_ATTRIBUTES.STUDENT_NAME] === contactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME])
    }

    const getStudentList = (contactPerson) => {
        let studentsUnderThisPerson = studentsList.filter(student => student.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === contactPerson.key);
        return studentsUnderThisPerson
    }

    const dialogInitObj = {
        isShow: false,
        title: '',
        message: '',
        targetStudent: null,
        comfirmAction: null
    }

    const [whoOpenMenu, setWhoOpenMenu] = useState(null)
    const [viewContactPersonDetail, setViewContactPersonDetail] = useState(null);
    const [editContactPerson, setEditContactPerson] = useState(null);
    const [dialogOption, setDialogOption] = useState(dialogInitObj)

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        getData();
    }, [isOpenCreateForm, viewContactPersonDetail, dialogOption, editContactPerson, refreshAttr])

    const closeAllDialog = () => {
        setDialogOption(dialogInitObj)
        setViewContactPersonDetail(null)
        setEditContactPerson(null)
    }

    //  Dialog for comfirmation of hide/delete student. 
    const HiddenDialog = () => (
        <Dialog
            open={dialogOption.isShow}
            onClose={() => setDialogOption(dialogInitObj)}
            aria-labelledby={`dialog-title`}
            aria-describedby={`dialog-description`}
        >
            <DialogTitle id={`dialog-title`}>
                {dialogOption.title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id={`dialog-description`} >
                    {dialogOption.message}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={e => closeAllDialog()}>Cancel</Button>
                <Button onClick={e => { dialogOption.comfirmAction(dialogOption.targetStudent); setDialogOption(dialogInitObj) }} autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )

    // This is the Menu while user click one of the contactPerson
    const DetailMenu = ({ contactPerson }) => {

        let contactPersonState = contactPerson.data[CONTACT_PERSON_ATTRIBUTES.STATE];

        let handleToggleHideReactivate = async () => {
            await db_contactPerson.toggleHideActivate(contactPerson).then(res => {
                setRefreshAttr(!refreshAttr)
            })

        }

        let handleDeleteStudent = async () => {
            db_contactPerson.deleteContactPersonWithStudents(contactPerson).then(res => setRefreshAttr(!refreshAttr))

        }

        let handleMenuClickView = () => {
            setViewContactPersonDetail(contactPerson)
        }

        let handleMenuClickHidden = () => {
            setDialogOption({
                isShow: true
                , message: 'You can find the student in the Hidden Student List after hiding them.'
                , title: `Are you sure you want to hide ${contactPerson.data[STUDENT_ATTRIBUTES.CONTACT_NAME]}?`
                , targetStudent: contactPerson
                , comfirmAction: () => { handleToggleHideReactivate() }
            })
        }

        let handleMenuClickDelete = () => {
            closeAllDialog();
            setDialogOption({
                isShow: true
                , message: 'You cannot find this student anymore after deletion.'
                , title: `Are you sure you want to delete ${contactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]}?`
                , comfirmAction: () => { handleDeleteStudent() }
            })
        }

        let handleMenuClickReactivate = () => {
            closeAllDialog();
            handleToggleHideReactivate()
        }

        let handleMenuClickEdit = () => {
            setIsOpenCreateForm(true)
            setEditContactPerson(contactPerson);
        }

        return (
            <Box sx={{
                borderTop: '2px #eee solid',
                marginTop: '15px',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '10px'
            }}>
                <Button variant='contained' color="success" onClick={() => { handleMenuClickView(contactPerson) }} ><PageviewIcon /></Button>
                <Button variant='contained' color='info' onClick={() => { handleMenuClickEdit(contactPerson) }}><EditIcon /></Button>

                {contactPerson.data[CONTACT_PERSON_ATTRIBUTES.STATE] === CONTACT_PERSON_STATE.NORMAL ? (
                    <Button variant='contained' color='info' onClick={() => { handleMenuClickHidden(contactPerson) }}><VisibilityOffIcon /></Button>
                ) : (
                    <Button variant='contained' color='info' onClick={() => { handleMenuClickReactivate(contactPerson) }}><VisibilityIcon /></Button>
                )}

                <Button variant='contained' color='error'
                    onClick={async () => { handleMenuClickDelete(contactPerson) }}
                ><DeleteForeverIcon /></Button>
            </Box>
        )
    }

    /**
     *  Student Card Component 
     */
    const StudentCard = ({ contactPerson }) => {
        let isSingle = isSingleStudent(contactPerson);
        let contactPersonName = contactPerson.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME];
        let studentUnderThisPerson = getStudentList(contactPerson);
        let studentAmount = studentUnderThisPerson.length;

        let maleBgColor = '#347DC1'
        let femaleBgColor = '#CC6594'
        let noneGenderBgColor = '#E8E6E6'
        let whiteColor = '#fff'
        let blackColor = '#000'

        let mapGenderColor = (gender) => {
            switch (gender) {
                case GENDER.MALE:
                    return {
                        background: maleBgColor,
                        color: whiteColor
                    };
                case GENDER.FEMALE:
                    return {
                        background: femaleBgColor,
                        color: whiteColor
                    };
                case GENDER.NONE:
                    return {
                        background: noneGenderBgColor,
                        color: blackColor
                    };
            }
        }

        let StudentNameTag = styled(Paper)(({ theme, gender }) => ({
            // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
            ...mapGenderColor(gender),
            ...theme.typography.body2,
            fontSize: '0.8em',
            padding: '2px 7px',
            borderRadius: '50px',
            marginLeft: '4px',
            marginRight: '4px',
            marginBottom: '4px',
            textAlign: 'center',
            fontWeight: '500',
        }));

        let contactNameStyle = { fontSize: '1.2em', fontWeight: 700 }

        // let IconDiv = () => {
        //     let iconCommonStyle = { fontSize: '2em' }

        //     let GroupIconDiv = ({ StudentLength }) => (
        //         <>
        //             <Box sx={{
        //                 position: 'absolute',
        //                 top: 5,
        //                 right: 5,
        //                 background: '#bf343d',
        //                 borderRadius: '50%',
        //                 color: '#f3f2f7',
        //                 width: '15px',
        //                 height: '15px',
        //                 fontSize: '9px',
        //                 textAlign: 'center',
        //                 lineHeight: '15px',
        //             }}>{StudentLength}</Box>
        //             <GroupsIcon sx={{ ...iconCommonStyle }} />
        //         </>
        //     )


        //     return (
        //         <Box
        //             sx={{
        //                 position: 'relative'
        //                 , border: '1px solid #CCC'
        //                 , borderRadius: '50%'
        //                 , width: '50px', height: '50px'
        //                 , padding: '10px'
        //                 , overflow: 'hidden'
        //                 , ...commonStyle_CenterImgText
        //             }}>
        //             {isSingle ? <PersonIcon sx={{ ...iconCommonStyle }} /> : <GroupIconDiv StudentLength={studentAmount} />}
        //         </Box>
        //     )
        // }

        const handleToggleDetailMenu = () => {
            if (whoOpenMenu === contactPerson.key) {
                setWhoOpenMenu(null)
            } else {
                setWhoOpenMenu(contactPerson.key)
            }
        }


        return (
            <Paper elevation={2} sx={{ padding: '10px', minHeight: '70px' }}>
                <Grid container direction='row' alignItems={'center'}
                    onClick={() => handleToggleDetailMenu(contactPerson)}
                >

                    <Grid item xs={8} sx={{ paddingLeft: '5px' }}>
                        {isSingle
                            ? (
                                <span style={{ ...contactNameStyle, }}>{contactPersonName}</span>
                            )
                            : (
                                <>
                                    {/* Contact Person Name and students name */}
                                    <Grid container direction='column' justifyContent={'center'} wrap='wrap' >
                                        <Grid item xs={12} sx={{ paddingBottom: '5px' }}>
                                            <span style={{ ...contactNameStyle, }}>{contactPersonName}</span>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack direction={'row'} alignItems={'center'} flexWrap={'wrap'}>
                                                <span style={{ fontSize: '0.8em' }}>With</span>
                                                {studentUnderThisPerson.map(student => (
                                                    <StudentNameTag key={student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} gender={student.data[STUDENT_ATTRIBUTES.GENDER]}>
                                                        {student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]}
                                                    </StudentNameTag>
                                                ))}
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                </>
                            )}
                    </Grid>

                    <Grid item xs={2}>
                        <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center' }}>
                            {/* <IconDiv /> */}
                            <AvatarGroup max={2}>
                                {studentUnderThisPerson.map(student => {
                                    return (student.data[STUDENT_ATTRIBUTES.IMAGE_URI]
                                        ? (
                                            <Avatar
                                                key={`${student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} image`}
                                                sx={{ height: '50px', width: '50px' }}
                                                alt={`${student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} image`}
                                                src={student.data[STUDENT_ATTRIBUTES.IMAGE_URI]}
                                            />

                                        ) : (
                                            <Avatar
                                                key={`${student.data[STUDENT_ATTRIBUTES.STUDENT_NAME]} image`}
                                                sx={{ height: '50px', width: '50px' }}
                                            >
                                                {student.data[STUDENT_ATTRIBUTES.STUDENT_NAME][0].toUpperCase()}
                                            </Avatar>
                                        ))
                                }

                                )}
                            </AvatarGroup>
                        </Box>
                    </Grid>

                </Grid>

                {whoOpenMenu === contactPerson.key ? (<DetailMenu contactPerson={contactPerson} />) : null}
            </Paper >
        )
    }

    const ListOfStudent = ({ contactPersonState, searchCriteria }) => (
        <>
            <Stack spacing={2}>
                {
                    searchCriteria ?
                        (
                            contactPersons
                                .filter(res =>
                                    res.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME].includes(searchCriteria) ||
                                    res.data[CONTACT_PERSON_ATTRIBUTES.PHONE].includes(searchCriteria) ||
                                    res.data[CONTACT_PERSON_ATTRIBUTES.EMAIL].includes(searchCriteria) ||
                                    studentsList.filter(studentRes =>
                                        studentRes.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === res.key &&
                                        studentRes.data[STUDENT_ATTRIBUTES.STUDENT_NAME].includes(searchCriteria)
                                    ).length > 0

                                ).map(person => <StudentCard key={person.key} contactPerson={person} />)
                        ) : (
                            contactPersons
                                .filter(res => res.data[CONTACT_PERSON_ATTRIBUTES.STATE] === contactPersonState)
                                .map(person => <StudentCard key={person.key} contactPerson={person} />))
                }
            </Stack>
        </>
    )

    const [studentAvailableNumber, setStudentAvailableNumber] = useState(0);
    const [studentHiddenNumber, setStudentHiddenNumber] = useState(0);
    const [studentTotalNumber, setStudentTotalNumber] = useState(0);


    useEffect(() => {
        if (studentsList.length >= 0) {
            setStudentTotalNumber(studentsList.length)
            setStudentHiddenNumber(studentsList.filter(student => student.data[STUDENT_ATTRIBUTES.STATE] === STUDENT_STATE.HIDDEN).length)
            setStudentAvailableNumber(studentsList.filter(student => student.data[STUDENT_ATTRIBUTES.STATE] === STUDENT_STATE.NORMAL).length)
        }
    }, [studentsList])

    const StudentNumberSection = () => {
        let outterGridStyle = {
            borderRadius: '5px',
            overflow: 'hidden'
        }

        let innerGridStyle = {
            color: 'white',
        }

        let titleStyle = {
            fontWeight: '500',
            fontSize: '0.9em',
        }

        let numberStyle = {
            fontWeight: '700',
            fontSize: '1.3em',
            textAlign: 'center'
        }

        let buttonStyle = {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '5px',
            paddingBottom: '5px',
        }

        let handleClickAvailable = () => {
            setAvailableStudentExpanded(true);
            setHiddenStudentExpanded(false);
        }

        let handleClickHidden = () => {
            setAvailableStudentExpanded(false);
            setHiddenStudentExpanded(true);
        }

        let handleClickTatol = () => {
            setAvailableStudentExpanded(true);
            setHiddenStudentExpanded(true);
        }

        return (
            <>
                <Grid container sx={outterGridStyle}>
                    <Grid item xs={4} sx={{ background: btnBgColors.available, ...innerGridStyle }}>
                        <ButtonBase onClick={handleClickAvailable} sx={buttonStyle}>
                            <Typography sx={{ ...titleStyle }}>Available</Typography>
                            <Typography sx={{ ...numberStyle }}>{studentAvailableNumber}</Typography>
                        </ButtonBase>
                    </Grid>
                    <Grid item xs={4} sx={{ background: btnBgColors.hidden, ...innerGridStyle }}>
                        <ButtonBase onClick={handleClickHidden} sx={buttonStyle}>
                            <Typography sx={{ ...titleStyle }}>Hidden</Typography>
                            <Typography sx={{ ...numberStyle }}>{studentHiddenNumber}</Typography>
                        </ButtonBase>
                    </Grid>
                    <Grid item xs={4} sx={{ background: btnBgColors.total, ...innerGridStyle }}>
                        <ButtonBase onClick={handleClickTatol} sx={buttonStyle}>
                            <Typography sx={{ ...titleStyle }}>Total</Typography>
                            <Typography sx={{ ...numberStyle }}>{studentTotalNumber}</Typography>
                        </ButtonBase>

                    </Grid>
                </Grid>
            </>
        )
    }

    const SORTING_METHODS = {
        CREATED_DATE: CONTACT_PERSON_ATTRIBUTES.CREATED_DATE,
        CONTACT_PERSON_NAME: CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME,
        AMOUNT_OF_STUDENT: 'amountOfStudent',
    }

    const mapSortingMethods = [
        { label: 'Date Created', value: SORTING_METHODS.CREATED_DATE },
        { label: 'Contact name', value: SORTING_METHODS.CONTACT_PERSON_NAME },
        { label: 'Amount of students', value: SORTING_METHODS.AMOUNT_OF_STUDENT },
    ]

    const [sortingMethod, setSortingMethod] = useState(SORTING_METHODS.CREATED_DATE)
    const [searchBarText, setSearchBarText] = useState('')

    useEffect(() => {
        setSearchBarText('')
        db_contactPerson.getCollection().then(allContactPerson => {
            let sortedResult;
            switch (sortingMethod) {
                case SORTING_METHODS.CREATED_DATE:
                    sortedResult = allContactPerson.sort((a, b) => {
                        return moment(a.data[CONTACT_PERSON_ATTRIBUTES.CREATED_DATE]) < moment(b.data[CONTACT_PERSON_ATTRIBUTES.CREATED_DATE])
                            ? 1
                            : moment(a.data[CONTACT_PERSON_ATTRIBUTES.CREATED_DATE]) > moment(b.data[CONTACT_PERSON_ATTRIBUTES.CREATED_DATE])
                                ? -1
                                : 0
                    })
                    setContactPersons(sortedResult)
                    break;

                case SORTING_METHODS.CONTACT_PERSON_NAME:
                    sortedResult = allContactPerson.sort((a, b) => {
                        return a.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME] > b.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]
                            ? 1
                            : a.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME] < b.data[CONTACT_PERSON_ATTRIBUTES.CONTACT_NAME]
                                ? -1
                                : 0
                    })
                    setContactPersons(sortedResult)
                    break;

                case SORTING_METHODS.AMOUNT_OF_STUDENT:
                    db_students.getCollection().then(students => {
                        sortedResult = allContactPerson.sort((a, b) => {
                            let amountOfStudentA = students.filter(rec => rec.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === a.key).length;
                            let amountOfStudentB = students.filter(rec => rec.data[STUDENT_ATTRIBUTES.CONTACT_PERSON_KEY] === b.key).length;

                            console.log('amountOfStudentA', amountOfStudentA, 'amountOfStudentB', amountOfStudentB)

                            return amountOfStudentA < amountOfStudentB
                                ? 1
                                : amountOfStudentA > amountOfStudentB
                                    ? -1
                                    : 0
                        })
                        setContactPersons(sortedResult)
                    })
                    break;
            }
        })
    }, [sortingMethod])

    const SortingSection = () => {

        let [anchorEl, setAnchorEl] = React.useState(null);
        let open = Boolean(anchorEl);
        let handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };
        let handleClose = () => {
            setAnchorEl(null);
        };

        return (
            // <Button variant='contained' color='info' sx={{ height: '100%' }}>
            //     <SortIcon  />
            // </Button>
            <>
                <IconButton
                    id="demo-positioned-button"
                    aria-controls={open ? 'demo-positioned-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                    color='info'
                    sx={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '5px',
                        border: '1px solid #aaa'
                    }}
                >
                    <SortIcon sx={{ fontSize: '1.7em' }} />
                </IconButton>
                <Menu
                    id="demo-positioned-menu"
                    aria-labelledby="demo-positioned-button"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    {mapSortingMethods.map(method => <MenuItem onClick={() => setSortingMethod(method.value)} key={method.label}>{method.label}</MenuItem>)}
                    {/* <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem> */}
                </Menu>
            </>

            // <FormControl sx={{ m: 1 }} variant="standard">
            //     <InputLabel id="sorting-select-label">Sort by</InputLabel>
            //     <Select
            //         labelId="sorting-select-label"
            //         id="sorting-select"
            //         value={sortingMethod}
            //         onChange={(e) => setSortingMethod(e.target.value)}

            //     >
            //         {mapSortingMethods.map(method => <MenuItem value={method.value}>{method.label}</MenuItem>)}

            //     </Select>
            // </FormControl>
        )
    }


    /**
     * --------
     *  COMPONENT RENDER
     * --------
     */
    return (contactPersons && studentsList) ?
        <>
            <Container sx={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <Typography sx={{
                    marginBottom:'5px',
                    paddingLeft:'5px',
                    borderLeft: '3px solid black',
                    textAlign: 'left',
                    fontWeight: '700',
                    fontSize: '0.9em',
                }}>STUDENT LIST</Typography>
                <StudentNumberSection />
            </Container>

            <Container>

                <Box sx={{
                    display: 'flex'
                    , alignItems: 'center'
                    , paddingTop: '10px'
                    , paddingBottom: '10px'
                }}>
                    {/* Sorting button */}
                    <SortingSection />
                    {/* Search Bar */}
                    <TextField
                        fullWidth
                        id="student-searchBar"
                        label="Search..."
                        variant="outlined"
                        sx={{ paddingLeft: '10px' }}
                        value={searchBarText}
                        onChange={(e) => setSearchBarText(e.target.value)}
                    />
                </Box>

                <div>
                    <Typography sx={{
                        background: '#aaa',
                        color: 'white',
                        fontSize: '0.8em',
                        width: 'fit-content',
                        padding: '2px 8px',
                        fontWeight: 700,
                        border: '2px solid #aaa',
                        borderRadius: '10px'
                    }}>Sorted by: <span style={{ color: '#74ff9d' }}>{mapSortingMethods.find(rec => rec.value === sortingMethod).label}</span></Typography>
                </div>
                {searchBarText === '' ? (
                    <>
                        <Accordion expanded={availableStudentExpanded} onChange={() => setAvailableStudentExpanded(!availableStudentExpanded)}>
                            <AccordionSummary
                                aria-controls="available-student-content"
                                id="available-student-header"
                                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                sx={{
                                    background: btnBgColors.available
                                }}
                            >
                                <Typography color={'white'}>Available Student{studentAvailableNumber > 1 ? "s" : null}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
                                <ListOfStudent contactPersonState={CONTACT_PERSON_STATE.NORMAL} />
                            </AccordionDetails>
                        </Accordion>


                        <Accordion expanded={hiddenStudentExpanded} onChange={() => setHiddenStudentExpanded(!hiddenStudentExpanded)}>
                            <AccordionSummary
                                aria-controls="hidden-student-content"
                                id="hidden-student-header"
                                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                sx={{
                                    background: btnBgColors.hidden
                                }}
                            >
                                <Typography color={'white'}>Hidden Student{studentHiddenNumber > 1 ? "s" : null}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
                                <ListOfStudent contactPersonState={CONTACT_PERSON_STATE.HIDDEN} />
                            </AccordionDetails>
                        </Accordion>
                    </>
                ) : (
                    <>
                        <ListOfStudent searchCriteria={searchBarText} />
                    </>
                )
                }

            </Container>

            <StudentCreateForm isShow={isOpenCreateForm} setIsShow={setIsOpenCreateForm} targetStudent={editContactPerson} setTargetStudent={setEditContactPerson} refresh={refreshAttr} setRefresh={setRefreshAttr} />
            <HiddenDialog />
            <StudentDetail selectedContactPerson={viewContactPersonDetail} setSelectedContactPerson={setViewContactPersonDetail} />
        </>
        : 'Loading'

}
