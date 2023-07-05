import { Box, Paper, Typography } from '@mui/material'
import React, { Children } from 'react'

function WidgetFrame({ children, background = '#f2f2f2', titleText = 'not set', helperText ,helperTextColor = 'black' }) {

    const titleStyle = {
        textAlign: 'right',
        color: '#2A4359',
        fontWeight: 900,
        fontSize: '1.3em'
    }

    return (
        <>
            {/* Main Widget Component */}
            <Paper sx={{ padding: '13px', borderRadius: '15px', background }}>
                {/* Title */}
                <Box sx={{
                    paddingBottom: '20px',
                }}>
                    <Typography component={'h2'} sx={titleStyle}>{titleText.toUpperCase()}</Typography>
                    {helperText? 
                    <Typography sx={{
                        textAlign:'right',
                        fontSize: '0.8em',
                        fontWeight:'500',
                        color: helperTextColor
                    }}>
                       {helperText}
                    </Typography>
                :null}
                </Box>

                {children}
            </Paper>

        </>
    )

}

export default WidgetFrame