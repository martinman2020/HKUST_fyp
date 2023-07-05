import { Box, CircularProgress, Container, Typography } from '@mui/material'
import React from 'react'
import logo from './icon.png'

function LoadingPage({ title, description, isShowLogo = true }) {

    const containerStyle = {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
    }

    const titleStyle = {
        paddingTop: '25px',
        fontWeight: '700',
        fontSize: '1.6em',
    }

    const descriptionStyle = {
        paddingTop: '5px',
    }
    return (
        <Container sx={{
            ...containerStyle,

        }}>
            {isShowLogo ?
                <Box>
                    <img src={logo} style={{
                        width: '70px',
                        height: '70px',
                        margin: '20px',
                    }} />
                </Box> : null
        }

            <Box>
                <CircularProgress />
            </Box>
            <Box>
                <Typography component={'h1'} sx={titleStyle}>{title}</Typography>
                <Typography component={'h2'} sx={descriptionStyle}>{description}</Typography>
            </Box>
        </Container>
    )
}

export default LoadingPage