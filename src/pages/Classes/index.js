import {
    Container,
    Grid,
    Typography,
    IconButton,
    Button,
    ButtonBase,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { React, useEffect, useState } from 'react';

import { ClassCreateForm } from '../../components/ClassCreateForm'
import { ClassScheduler } from '../../components/ClassScheduler'
import { ClassList } from '../../components/ClassList'
import { btnBgColors, pageHeader } from '../../components/commonStyle';

import PageFrame, { PAGES_NAME } from '../PageFrame';
import ClassSchedulerSettingBtn from '../../components/ClassSchedulerSettingBtn';
import { shortcutButtonStyle } from '../style/shortcutButtonStyle';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

export default function Classes() {

    const [availableClassExpanded, setAvailableClassExpanded] = useState(true);
    const [isShowCreateForm, setIshowCreateForm] = useState(false);
    const [refreshRequest, setRefreshRequest] = useState(false);

    const CreateClassIcon = () => {
        return (
            <ButtonBase
                variant="contained"
                color='primary'
                sx={{ background: '#3e864a', ...shortcutButtonStyle }}
                onClick={() => setIshowCreateForm(true)}
            >
                <AddIcon /> New class
            </ButtonBase>
        )
    }

    return (
        <PageFrame pageName={PAGES_NAME.CLASS} rightComponent={
        <>
            <ClassSchedulerSettingBtn refreshToggle={refreshRequest} setRefreshToggle={setRefreshRequest} />
        </>} >

            <ClassScheduler refresh={refreshRequest} setRefresh={setRefreshRequest} />

            <Container sx={{ paddingTop: '10px', paddingBottom: '10px' }}>
                <Grid container flex justifyContent={'flex-end'}>
                    <Grid item>
                        <CreateClassIcon />
                    </Grid>
                </Grid>
            </Container>

            <Container>
                {/* Available Classes */}
                <Accordion expanded={availableClassExpanded} onChange={() => setAvailableClassExpanded(!availableClassExpanded)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                        sx={{
                            background: btnBgColors.available
                        }}
                    >
                        <Typography sx={{ color: 'white' }}>Available Classes</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ClassList refresh={refreshRequest} setRefresh={setRefreshRequest} />
                    </AccordionDetails>
                </Accordion>

            </Container>



            <ClassCreateForm isOpen={isShowCreateForm} setIsOpen={setIshowCreateForm} selectedClass={null} setSelectedClass={null} refresh={refreshRequest} setRefresh={setRefreshRequest} />
        </PageFrame>
    )
}

