import React, { useEffect, useState } from 'react'
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI'
import { EbusinessCardAPI } from '../../api/EbusinessCardAPI';
import QRCode from "react-qr-code";

import Login from './login'
import { Link } from 'react-router-dom';
import { Button, Container, Grid, Typography } from '@mui/material';

function EBusinessCard() {

    const db_preference = new CollectionPreferenceAPI();


    const [cardId, setCardId] = useState(null);
    const [cardData, setCardData] = useState(null);

    const originURL = window.location.origin
    const cardPath = `${originURL}/ebusinessCard`
    const loginURL = "/ebusinessCard/login"

    const handleLogout = () => {
        db_preference.setAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID, null).then(() => {
            window.location.assign(loginURL);
        })
    }

    useEffect(() => {
        // console.log(window.location.origin)
        db_preference.getAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID).then((res) => {
            if (res) {
                setCardId(res)
                EbusinessCardAPI.fetchCardById(res).then(res => {
                    console.log('EbusinessCardAPI.fetchCardById()', res);
                })
            } else {
                window.location.assign(loginURL);
            }
        })
    }, [])



    return (
        <Container>
            <Grid container flex flexDirection='column' justifyContent='center' height={'100vh'} alignItems='center' >

                <Grid item>
                    <Typography sx={{
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '1.2em',
                    }}>QR code to your e-business card</Typography>
                </Grid>
                <Grid item sx={{
                    padding: '30px',
                }}>
                    <QRCode value={`${originURL}/card/${cardId}`} />
                </Grid>

                <Grid item sx={{
                    width: '90%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',

                }}>
                    {window.navigator.onLine ? (
                        <>
                            <Button variant='contained' color="success"><Link to={`/card/${cardId}`} style={{
                                color: 'white',
                                textDecoration: 'none'

                            }}>Go to card</Link> </Button>

                            <Button variant='contained' color="info"><Link to={`/ebusinesscard/update`} style={{
                                color: 'white',
                                textDecoration: 'none'
                            }}>Update card</Link> </Button>
                        </>
                    ) : (
                        <Typography sx={{
                            fontWeight: 600,
                            color: '#d65344',
                            padding: '5px',
                        }}>*Please keep the connection and maintain the connection stable to activate this widget.</Typography>
                    )}


                </Grid>

                <Grid item sx={{
                    paddingTop: '20px',
                    width: '90%',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                }}>
                    <Button onClick={handleLogout} variant='contained' color='error' >Logout</Button>
                </Grid>
            </Grid>
        </Container>
    )
}

export default EBusinessCard