// MUI
import {
    Button
    , Paper
    , Typography
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


import React from 'react';
import { Box } from '@mui/system';



export function SubpageHeader({ title, onclose, bgcolor, textcolor, rightComponent }) {
    return <div>
        <Box elevation={3}
        sx={{
            background: bgcolor,
            height: '60px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: '20px',
            boxShadow: '-2px 0px 5px #aaa',
        }}
        >
            <Button sx={{
                
            }} onClick={() => onclose(null)} ><ArrowBackIcon sx={{ color: textcolor }} /></Button>
            <Typography sx={{
                color: textcolor,
                lineHeight: '40px',
                fontWeight: 700,
                fontSize: '1.2em'
            }}>{title}</Typography>

            {/* {rightComponent ? <Box>rightComponent</Box> : null} */}
            
        </Box>
    </div>;
}
