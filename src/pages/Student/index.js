import { React, useState } from 'react';

import { StudentCreateForm } from '../../components/StudentCreateForm';

import EventNoteIcon from '@mui/icons-material/EventNote';

// MUI
import {
    Box
    , Container
    , Grid
    , ButtonBase
} from '@mui/material';

// MUI ICON
import AddIcon from '@mui/icons-material/Add';

import { StudentList } from '../../components/StudentList';
import TuitionSetForm from '../../components/TuitionSetForm';
import PageFrame, { PAGES_NAME } from '../PageFrame';
import { shortcutButtonStyle } from '../style/shortcutButtonStyle';


function Student() {
    const [editTarget, setEditTarget] = useState();
    const [requestRefresh, setRequestRefresh] = useState(false);

    const [isShowCreateForm, setIsShowCreateForm] = useState(false); // for create and edit form transmit the state.
    const [isOpenTuitionSetForm, setIsOpenTuitionSetForm] = useState(false);

    // for expend of Accordion component on hidden student list 
    // const [hiddenStudentExpanded, setHiddenStudentExpanded] = useState(false)
    //--------------------------------------------

    // for the popup menu of Edit/Hide/Delete 
    // const [popupMenu, setPopupMenu] = useState('');


    const Shortcuts = () => {
        let containerStyle = { padding: '5px' };

        let btnBgColors = {
            tuitionSet: '#9e9341',
            newStudent: '#3e864a'
        }

        return (
            <Box sx={{ ...containerStyle }}>
                <Grid container flex justifyContent={'space-evenly'} alignContent={'center'} flexWrap={'wrap'}>
                    <Grid item>
                        <ButtonBase sx={{ background: btnBgColors.tuitionSet, ...shortcutButtonStyle }} onClick={() => setIsOpenTuitionSetForm(true)}> <EventNoteIcon /> Set Tuition</ButtonBase>
                    </Grid>
                    <Grid item>
                        <ButtonBase sx={{ background: btnBgColors.newStudent, ...shortcutButtonStyle }} onClick={() => setIsShowCreateForm(true)}><AddIcon /> New Student </ButtonBase>
                    </Grid>
                </Grid>
            </Box>
        )
    }

    return (
        <>
            {/* We combian the create form and edit form. Which can determine by prop targetStudent. If targetStudent === null, the form is opened as create mode, vice versa */}
            <StudentCreateForm isShow={isShowCreateForm} setIsShow={setIsShowCreateForm} targetStudent={editTarget} setTargetStudent={setEditTarget} refresh={requestRefresh} setRefresh={setRequestRefresh} />

            <TuitionSetForm isOpen={isOpenTuitionSetForm} setIsOpen={setIsOpenTuitionSetForm} />

            <PageFrame pageName={PAGES_NAME.STUDENT}>
                <Container >
                    <Shortcuts />
                </Container>

                <StudentList refreshAttr={requestRefresh} setRefreshAttr={setRequestRefresh} />

            </PageFrame>
        </>
    )
}

export default Student
