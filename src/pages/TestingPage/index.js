import React, { useEffect, useState } from 'react'
import {
    Container
    , Grid
    , Button,
    Select,
    MenuItem,
    Box
} from '@mui/material';

import { CLASS_FORM_ATTRIBUTES, CollectionClassAPI } from '../../api/CollectionClassAPI';
import { CollectionAttendanceAPI } from '../../api/CollectionAttendanceAPI';


function TestingPage() {

    const [classRecords, setClassRecords] = useState(null)
    const [selectedClassKey, setSelectedClassKey] = useState(null)
    // const [result, setResult] = useState(null)

    const db_class = new CollectionClassAPI();
    const db_attendance = new CollectionAttendanceAPI();

    useEffect(() => {
        db_class.getCollection().then(res => { setClassRecords(res); setSelectedClassKey(res[0].key)})
    }, [])



    const handleCreateTicketFromLast = () => {
        db_attendance.createTicketFromLast(classRecords.find(rec=>rec.key === selectedClassKey))
    }

    return (
        <Container sx={{ padding: '20px 0' }}>
            <h1>TestingPage</h1>

            <Grid container>
                <Grid item 
                sx={{
                    display: 'flex',
                    flexDirection:'column'
                }}>
                    <Select
                        label="class"
                        value={selectedClassKey}
                        onChange={(e)=>setSelectedClassKey(e.target.value)}
                    >
                        { classRecords?
                            classRecords.map(rec => <MenuItem key={rec.key} value={rec.key}>{rec.data[CLASS_FORM_ATTRIBUTES.CLASS_NAME]}</MenuItem>)
                            : <MenuItem value={null}>Loading</MenuItem>
                        }
                    </Select>
                    <Button variant='contained' onClick={handleCreateTicketFromLast}>create Ticket From Last</Button>
                </Grid>

                {/* <Grid item xs={12}>
                    <Box
                        sx={{
                            minHeight: '150px',
                            border: '2px solid #aaa',
                        }}
                    >
                        {result}
                    </Box>
                </Grid> */}
            </Grid>

        </Container>
    )
}

export default TestingPage