import { Container, Typography, Link, Grid } from '@mui/material';

import React, { useEffect, useState } from 'react'
import QRCode from 'react-qr-code';
// import { Link } from 'react-router-dom';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI'
import WidgetFrame from '../WidgetFrame'


function WidgetEBusinessCard() {
    const db_preference = new CollectionPreferenceAPI();

    const [cardId, setCradId] = useState(null);

    const originURL = window.location.origin


    useEffect(() => {
        db_preference.getAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID).then(res => setCradId(res))
    }, [])

    let requireNetworkStyle = {

    }

    let noCardTextStyle = {
        textAlign: 'center', padding: '20px 5px', border: '2px solid #ccc', borderRadius: '5px'
    }

    let buttonStyle = {
        width: '110px'
        , textAlign: 'center'
        , color: 'white'
        , padding: '10px'
        , borderRadius: '10px'
        , fontSize: '1.1em'
        , margin: '0 10px'
    }

    return (
        <WidgetFrame background='#CCF0E6' titleText='E-BUSINESS CARD' helperText='*Require network' helperTextColor='#D75441'>

            {
                cardId ?
                    <Container>
                        <Grid container>
                            <Grid item xs={12} sx={{ textAlign: 'center' }}>
                                <Link href='/ebusinesscard'>
                                    <QRCode value={`${originURL}/card/${cardId}`} bgColor='#CCF0E6aa' />
                                    <div style={{
                                        padding: '5px',
                                        background: '#1b79ce',
                                        textTransform: 'uppercase',
                                        color: 'white',
                                        letterSpacing: '4px',
                                        borderRadius: '8px',
                                        marginTop: '10px',
                                    }}>
                                        Detail
                                    </div>
                                </Link>
                            </Grid>
                        </Grid>
                    </Container>
                    :
                    <Container>
                        <Typography sx={{ ...noCardTextStyle }}> You have not created a card yet.</Typography>
                        <Grid container flex flexDirection={'row'} justifyContent='center' padding={'10px'}>

                            {window.navigator.onLine ? (
                                <>
                                    <Link
                                        href="/eBusinessCard/signup"
                                        underline="none"
                                        variant='button'
                                        sx={{
                                            ...buttonStyle,
                                            background: '#029070'
                                        }}
                                    >Sign up</Link>
                                    <Link
                                        href="/eBusinessCard/login"
                                        underline="none"
                                        variant='button'
                                        sx={{
                                            ...buttonStyle,
                                            background: '#0290D6'
                                        }}
                                    >Login</Link>
                                </>
                            ) : (
                                <Typography sx={{
                                    fontWeight: 600,
                                    color: '#d65344',
                                    padding: '5px',
                                }}>*Please keep the connection and maintain the connection stable to activate this widget.</Typography>
                            )}

                        </Grid>
                    </Container>
            }
        </WidgetFrame>
    )
}

export default WidgetEBusinessCard