import React, { useState, useEffect } from 'react'

import {
    Box
} from '@mui/material'


import PageFrame, { PAGES_NAME } from '../PageFrame'


function Offline() {

    return (
        <PageFrame pageName={PAGES_NAME.OFFLINE}>
            <Box
                sx={{
                    width: '100%'
                    , height: '100%'
                    , display: 'flex'
                    , justifyContent: 'center'
                    , alignItems: 'center'
                }}>
                You are offline. Please try another page.
            </Box>
        </PageFrame>
    )
}

export default Offline