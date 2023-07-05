import { Box, Container, Grid, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { CollectionPreferenceAPI } from '../../api/CollectionPreferenceAPI'
import { CollectionTuitionSetAPI } from '../../api/CollectionTuitionSetAPI'
import { CollectionIncomeCatAPI } from '../../api/CollectionIncomeCatAPI'
import { CollectionExpenseCatAPI } from '../../api/CollectionExpenseCatAPI'
import LoadingPage from '../../components/LoadingPage'

export const PAGES_NAME = {
    HOME: 'home',
    CLASS: 'class',
    STUDENT: 'student',
    FINANCE: 'finance',
    PREFERENCE: 'preference',
    OFFLINE: 'offline'
}

const unitStyle = {
    background: '#013b59',
    color: '#fff'
}

const FRAME_CONTENT = {
    [PAGES_NAME.HOME]: {
        title: 'HOME',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
    [PAGES_NAME.CLASS]: {
        title: 'CLASS',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
    [PAGES_NAME.STUDENT]: {
        title: 'STUDENT',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
    [PAGES_NAME.FINANCE]: {
        title: 'FINANCE',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
    [PAGES_NAME.PREFERENCE]: {
        title: 'PREFERENCE',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
    [PAGES_NAME.OFFLINE]: {
        title: 'OFFLINE',
        leftComponent: null,
        rightCompoenet: null,
        styles: {
            background: unitStyle.background,
            color: unitStyle.color
        }
    },
}

const containerStyle = {
    display:'flex',
    alignItem: 'flex-end',
    borderRadius: '0 0 50% 50%',
    // paddingBottom: '120px',
    marginBottom: '15px',
    height: '120px'
}

const titleStyle = {
    letterSpacing: '5px'
    , fontWeight: 700
    , fontSize: '1.5em'
}

function PageFrame({ pageName,setPre, leftComponent, rightComponent, ...props }) {

    const db_preference = new CollectionPreferenceAPI();
    const db_tuitionSet = new CollectionTuitionSetAPI();
    const db_incomeCat = new CollectionIncomeCatAPI();
    const db_expenseCat = new CollectionExpenseCatAPI();

    const [preference, setPreference] = useState(null)

    useEffect(() => {
        db_preference.initialize().then(_preference =>
            setPreference(_preference)
        )
        db_tuitionSet.initialize().then(tuitionSet=>{console.log('tuitionSet, ', tuitionSet)})
        db_incomeCat.initialize();
        db_expenseCat.initialize();
        
    }, [])

    let leftComponentGridStyle = {
        
    }

    let centerGridTitle = {
        textAlign: 'center',
    }

    let rightComponentGridStyle = {

    }

    return (
        <>
            {preference ? (
                <>
                    <Box sx={{  }}>
                        {/* Header */}
                        <Grid
                            container
                            flex
                            flexDirection={'row'}
                            justifyContent={'space-evenly'}
                            alignItems={'center'}
                            sx={{
                                ...containerStyle
                                , ...FRAME_CONTENT[pageName].styles
                            }}
                        >
                            <Grid item xs={2} sx={{...leftComponentGridStyle}}>{leftComponent}</Grid>

                            <Grid item xs={8} sx={{...centerGridTitle}}>
                                <Typography component={'h1'} sx={{
                                    ...titleStyle
                                }}>{FRAME_CONTENT[pageName].title.toUpperCase()}</Typography>
                            </Grid>

                            <Grid item xs={2} sx={{...rightComponentGridStyle}}
                            >{rightComponent}</Grid>
                        </Grid>

                        <Box sx={{width:'100%', paddingBottom:'150px'}}>
                            {props.children}
                        </Box>
                    </Box>
                </>) : (<>
                    <LoadingPage title={'Loading'} description={'Please wait a moment'} />
                </>)
            }
        </>
    )
}

export default PageFrame