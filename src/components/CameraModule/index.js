import { Box, Button, ButtonBase, Container, IconButton } from "@mui/material";
import { makeStyles } from '@mui/styles'

import React, { useEffect, useState } from "react";
import Webcam from 'react-webcam'
import LoadingPage from "../LoadingPage";

import ImagePreview from './ImagePreview';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import CameraswitchIcon from '@mui/icons-material/Cameraswitch';

const CameraModule = ({ isOpen, setIsOpen, dataUri, setDataUri }) => {

    const HEADER_HEIGHT = 70;
    const FRONT_CAM = "user", REAR_CAM = { exact: "environment" }

    const [imageUri, setImageUri] = useState(null);
    const [webcamHeight, setWebcamHeight] = useState(null);
    const [webcamWidth, setWebcamWidth] = useState(null);
    const [isConfirm, setIsConfirm] = useState(false);
    // const [cameraOption,setCameraOption] = useState({ exact: "environment" })
    const [cameraOption, setCameraOption] = useState(FRONT_CAM)

    const videoConstraints = {
        width: webcamWidth,
        height: webcamHeight,
        facingMode: cameraOption
    };

    const getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window;
        // console.log(`width: ${width} | height: ${height}`)
        return {
            width,
            height
        };
    }

    const isSupportCamera = ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices)

    useEffect(() => {
        let dim = getWindowDimensions()
        if (dim.height >= dim.width) {
            setWebcamHeight(dim.width)
            setWebcamWidth(dim.width)
        } else {
            setWebcamHeight(dim.height - HEADER_HEIGHT)
            setWebcamWidth(dim.height - HEADER_HEIGHT)
        }

        console.log("!!!!!!!!!!!", navigator.mediaDevices)

    }, [])

    useEffect(() => {
        if (isConfirm) {
            setDataUri(imageUri)
            setIsOpen(false)
            // console.log('The image is confirmed', imageUri)
        }
    }, [isConfirm])

    const useStyles = makeStyles({
        header: {
            height: `${HEADER_HEIGHT}px`,
            boxShadow: '#aaa -2px 1px 5px',
            display: 'flex',
            alignItems: 'center'
        },
        goBackButton: {
            marginLeft: '10px',
        },
        webcamContainer: {
            width: '100%', height: 'calc(100vh - 50px)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'
        },
        buttonsContainer: {
            width: "300px",
            position: 'absolute',
            bottom:'5%',
            display: 'flex',
            flexDirection:'row',
            justifyContent: 'space-between',
        },
        buttonPlaceHolder:{
            width: '70px',
            height:'70px',
        },
        captureButtonContainer: {
            background: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            border: '2px solid #444',
            width: '70px',
            height: '70px',
            boxShadow: '#555 -2px 2px 5px',
            transition:'0.3s',
            '&:hover':{
                background:'#ccc'
            }
        },
        captureButton: {
            background: '#eee',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            border: '2px solid gray',
        },
        swapCameraBtn: {
            width: '70px',
            height:'70px',
            background:'white',
            border: '2px solid #444',
            boxShadow: '#555 -2px 2px 5px',
            transition:'0.3s',
            '&:hover':{
                background:'#ccc'
            }
        },
        
    })
    const classes = useStyles();

    const Camera = () => (
        <>
            <Box className={classes.header}>
                <IconButton className={classes.goBackButton} onClick={() => setIsOpen(false)}>
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            {webcamHeight && webcamWidth
                ? (
                    <Box className={classes.webcamContainer}>


                        <Webcam
                            audio={false}
                            height={webcamHeight}
                            screenshotFormat="image/jpeg"
                            width={webcamWidth}
                            videoConstraints={{ ...videoConstraints, facingMode: cameraOption }}
                        >
                            {({ getScreenshot }) => (
                                <Box className={classes.buttonsContainer}>
                                    <Box className={classes.buttonPlaceHolder}></Box>

                                    <Box className={classes.captureButtonContainer}>
                                        <ButtonBase
                                            className={classes.captureButton}
                                            onClick={() => {
                                                const imageSrc = getScreenshot()
                                                // console.log(imageSrc)
                                                setImageUri(imageSrc);
                                            }}
                                        >
                                        </ButtonBase>
                                    </Box>

                                    <IconButton
                                        size="large"
                                        className={classes.swapCameraBtn}
                                        onClick={() => {
                                            setCameraOption(cameraOption === FRONT_CAM ? REAR_CAM : FRONT_CAM)
                                        }}
                                    >
                                        <CameraswitchIcon htmlColor="#444" fontSize="large"/>
                                    </IconButton>


                                </Box>
                            )}
                        </Webcam>
                        {/* {isSupportCamera ?
                            : (
                                <p>Your browser does not support Camera feature.</p>
                            ) */}
                        {/* } */}

                    </Box>
                )
                : (
                    <LoadingPage title='Fetching Data' description={'Please wait'} />
                )
            }
        </>
    )

    return (
        <>
            {
                (imageUri)
                    ? (<ImagePreview dataUri={imageUri} setDataUri={setImageUri} isConfirm={isConfirm} setIsConfirm={setIsConfirm} />)
                    : (<Camera />)
            }
        </>
    )

};

export default CameraModule