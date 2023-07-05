import { Box, Button, Container, Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EbusinessCardAPI } from '../../api/EbusinessCardAPI';
import LoadingPage from '../../components/LoadingPage'

import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { GENDER } from '../../api/CollectionStudentAPI';

import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SignalIcon from '../Card/Signal_icon.svg'
import EmailIcon from '@mui/icons-material/Email';
import getImageDimensions from '../../common/getImageDim';

function Card() {
    const { id } = useParams();

    const [cardData, setCardDate] = useState(null);
    const [imageDim,setImageDim] = useState({w:null,h:null})
    const [isLoading, setIsLoading] = useState(true);
     
    const noSuchPage = 'noSuchPage'

    useEffect(() => {
        EbusinessCardAPI.fetchCardById(id).then(res => {
            if (res.status === 200) {
                setCardDate(res.data);
                if(res.data.selectedFile){
                    getImageDimensions(res.data.selectedFile).then(res=>{
                        setImageDim(res)
                    })
                }
                
            } else {
                setCardDate(noSuchPage);
            }
        })
    }, [])

    let flex = {
        display: 'flex'
    }
    let flexJustifyCenter = {
        justifyContent: 'center'
    }
    let flexAlignCenter = {
        alignItems: 'center'
    }

    let imageContainerStyle = {
        width: '200px',
        height: '200px',
        overflow: 'hidden',
        borderRadius: '7px',
        padding: '0px',
        border: '2px solid #333'
    }

    let imageStyle = {
        objectFit: 'cover',
        width: imageDim.w > imageDim.h? 'auto': '102%',
        height: imageDim.h > imageDim.w? 'auto': '102%',
    }

    const style_smallIcon = {
        fontSize: '1.1em'
    }

    const dividerStyle = {
        fontSize: '0.9em',
        fontWeight: '700',
        paddingTop: '20px',
        paddingBottom: '10px',
        color: '#01547f'
    }

    const genderMappingColor = {
        [GENDER.FEMALE]: 'rgb(219,85,164)',
        [GENDER.MALE]: 'rgb(72,159,248)',
        [GENDER.NONE]: '#eee'
    }
    const genderMapping = {
        'f': <FemaleIcon sx={{ ...style_smallIcon, color: genderMappingColor[GENDER.FEMALE] }} />,
        'm': <MaleIcon sx={{ ...style_smallIcon, color: genderMappingColor[GENDER.MALE] }} />,
        'none': null
    }

    const Footer = () => (
        <Typography sx={{
            background: '#333',
            color: 'white',
            textAlign: 'center',
            fontWeight: 400,
            padding: '10px 0',
            fontSize: '0.8em',
        }}>
            E-Business card is provided by Freelancer-buddy
        </Typography>
    )


    const contactBtnStyle ={
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        display:'block',
        padding: '8px',
        // border: '2px solid red',
        borderRadius: '5px',
        marginTop: '10px',
        marginBottom: '10px',
        marginLeft: '5px',
        marginRight: '5px',

        
    }
    const contactMapping = (type, value) => {
        switch (type) {
            case 'phone':
                return (<a href={`tel:${value}`} target="_blank" style={{ ...contactBtnStyle, background: '#38505E' }} >
                    <PhoneAndroidIcon fontSize='large' htmlColor='#eee' />
                </a>)

            case 'whatsapp':
                return (<a href={`https://wa.me/${value}`} target="_blank" style={{ ...contactBtnStyle, background: '#52d164' }}>
                    <WhatsAppIcon fontSize='large' htmlColor='#eee' />
                </a>)

            case 'email':
                return (<a href={`mailto:${value}`} target="_blank" style={{ ...contactBtnStyle, background: '#cba150' }}>
                    <EmailIcon fontSize='large' htmlColor='#eee'/>
                </a>)

            case 'signal':
                return (<a href={`https://signal.me/#p/${value}`} target="_blank" style={{ ...contactBtnStyle,  border:' 2px #3a7aec solid'}}>
                    <img src={SignalIcon} style={{
                        width: '35px',
                        height: '35px'
                    }} />
                </a>)
        }
    }

    return (
        <>
            {cardData ?
                <>
                    <Grid container sx={{
                        paddingBottom: '100px'
                    }}>
                        <Grid item
                            sx={{
                                ...flex,
                                ...flexJustifyCenter
                                , background: '#a5c5d9'
                                , marginBottom: '75px'
                                , position: 'relative'
                            }}
                            xs={12}
                        >
                            <div
                                style={{
                                    ...imageContainerStyle,
                                    position: 'relative',
                                    bottom: '-75px',
                                }}>

                                <img src={cardData.selectedFile} style={imageStyle} alt={cardData.firstName + " " + cardData.lastName} />

                            </div>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography sx={{
                                padding: '10px 10px 0 10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 700,
                                fontSize: '1.8em',
                            }}>
                                {cardData.firstName} {cardData.lastName} {genderMapping[cardData.gender]}
                            </Typography>
                            <Typography sx={{
                                textAlign: 'center',
                                fontWeight: 500,
                                fontSize: '1.2em',
                            }}>
                                {cardData.title}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sx={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Box sx={{
                                display:'flex',
                                justifyContent: 'center',
                                alignItem: 'center',
                            }}>
                                {cardData.contact.length > 0 ?
                                    cardData.contact.map(item => contactMapping(item.type, item.value)) : null
                                }
                            </Box>

                        </Grid>


                        {
                            cardData.introduction ?
                                <>
                                    <Grid item xs={12}>
                                        <Divider light textAlign='center'
                                            sx={dividerStyle}
                                        >INTRODUCTION</Divider>
                                    </Grid>

                                    <Grid item xs={12}
                                        sx={{
                                            paddingBottom: '20px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >

                                        <Typography
                                            sx={{
                                                width: '90%',
                                                maxWidth: '450px',
                                                textAlign: 'left',
                                                fontWeight: 400,
                                                fontSize: '0.95em',
                                                color: '#555',
                                            }}>
                                            {cardData.introduction}
                                        </Typography>

                                    </Grid>
                                </>
                                : null
                        }

                        {
                            cardData.service.length > 0 ?
                                <>
                                    <Grid item xs={12}>
                                        <Divider light textAlign='center'
                                            sx={dividerStyle}
                                        >SERVICE</Divider>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Container sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                        }}>
                                            {
                                                cardData.service
                                                    .map(item => (
                                                        <Box
                                                            sx={{
                                                                width: 'fit-content',
                                                                padding: '5px',
                                                                marginBottom: '5px',
                                                                marginLeft: '5px',
                                                                marginRight: '5px',
                                                                border: '1px #bbb solid',
                                                                borderRadius: '5px'
                                                            }}
                                                        >{item}</Box>
                                                    )
                                                    )
                                            }
                                        </Container>
                                    </Grid>
                                </>
                                : null
                        }

                        {
                            cardData.experience.length > 0 ?
                                <>
                                    <Grid item xs={12}>
                                        <Divider light textAlign='center'
                                            sx={dividerStyle}
                                        >EXPERIENCE</Divider>
                                    </Grid>
                                    <Grid item xs={12}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ul style={{
                                            width: '90%',
                                            maxWidth: '450px',
                                        }}>
                                            {
                                                cardData.experience
                                                    .map(item => (
                                                        <li
                                                            key={item}
                                                            style={{
                                                                padding: '5px',
                                                                marginBottom: '5px',
                                                                marginLeft: '5px',
                                                                marginRight: '5px',
                                                                borderBottom: '1px #ddd solid',
                                                                borderRadius: '5px'
                                                            }}
                                                        >{item}</li>
                                                    )
                                                    )
                                            }
                                        </ul>

                                    </Grid>
                                </>
                                : null
                        }

                        {
                            cardData.award.length > 0 ?
                                <>
                                    <Grid item xs={12}>
                                        <Divider light textAlign='center'
                                            sx={dividerStyle}
                                        >AWARD</Divider>
                                    </Grid>

                                    <Grid item xs={12}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ul style={{
                                            width: '90%',
                                            maxWidth: '450px'
                                        }}>
                                            {
                                                cardData.award
                                                    .map(item => (
                                                        <li
                                                            key={item}
                                                            style={{
                                                                padding: '5px',
                                                                marginBottom: '5px',
                                                                marginLeft: '5px',
                                                                marginRight: '5px',
                                                                borderBottom: '1px #ddd solid',
                                                                borderRadius: '5px'
                                                            }}
                                                        >{item}</li>
                                                    )
                                                    )
                                            }
                                        </ul>
                                    </Grid>
                                </>
                                : null
                        }

                    </Grid>
                    <Footer />
                </>
                : <LoadingPage title={`Fetching business card data`} description={`Please wait a moment...`}/>
            }
        </>
    )
}

export default Card