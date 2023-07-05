import { Dialog } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI';
import { commonStyle_centeredBoxOnTheTopest } from '../commonStyle';

function SchedulerSetting({ isOpen, setIsOpen }) {
    const db_preference = new CollectionPreferenceAPI()

    const [formData,formData] = useState({
        defaultView: '',
        startTime: '',
        endTime: '',

    })

    useEffect(()=>{
        
    })

    return (
        <Dialog
            open={isOpen}
            onClose={(event, reason) => {
                if (reason && reason == 'backdropClick')
                    return;
                setIsOpen(false)
            }}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Box
                sx={{
                    ...commonStyle_centeredBoxOnTheTopest
                }}
            >


            </Box>

        </Dialog>
    )
}

export default SchedulerSetting