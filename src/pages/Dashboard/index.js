import { React, useState, useEffect } from 'react';


import { Box, Button, Container, Dialog, Stack } from '@mui/material';

import WidgetStudent from '../../components/WidgetStudent';
import WidgetComingLesson from '../../components/WidgetComingLesson';
import WidgetStudentTuition from '../../components/WidgetStudentTuition';
import PageFrame, { PAGES_NAME } from '../PageFrame';
import EnableNotificationBtn from '../../components/EnableNotificationBtn';
import WidgetWeather from '../../components/WidgetWeather';
import { CollectionIncomeCatAPI } from '../../api/CollectionIncomeCatAPI'
import { CollectionExpenseCatAPI } from '../../api/CollectionExpenseCatAPI'
import WidgetFinance from '../../components/WidgetFinance';
import WidgetEBusinessCard from '../../components/WidgetEBusinessCard';




function Dashboard() {
    // const NotificationTest = <Button onClick={() => { }}>Click for test Notification</Button>
    // const db_IncomeCat = new CollectionIncomeCatAPI();
    // const db_ExpenseCat = new CollectionExpenseCatAPI();
    const [refreshAttr, setRefreshAttr] = useState(false);

    return (
        <>


            <PageFrame pageName={PAGES_NAME.HOME}>
                {/* <EnableNotificationBtn /> */}
                <Stack spacing={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Container>
                        <WidgetWeather />
                    </Container>

                    <Container >
                        <WidgetComingLesson />
                    </Container>

                    <Container>
                        <WidgetStudentTuition parentRefresh={refreshAttr} setParentRefresh={setRefreshAttr}/>
                    </Container>

                    <Container>
                        <WidgetStudent />
                    </Container>

                    <Container>
                        <WidgetFinance parentRefresh={refreshAttr} setParentRefresh={setRefreshAttr}/>
                    </Container>

                    <Container>
                        <WidgetEBusinessCard />
                    </Container>

                </Stack>
            </PageFrame>
        </>
    )
}

export default Dashboard
