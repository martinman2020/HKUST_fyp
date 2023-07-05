import React from 'react';
import PropTypes from 'prop-types';

import './styles/imagePreview.css';
import { Box, Button } from '@mui/material';

export const ImagePreview = ({ dataUri,setDataUri, isFullscreen, isConfirm, setIsConfirm }) => {
    let classNameFullscreen = isFullscreen ? 'demo-image-preview-fullscreen' : '';

    return (
        <Box
            sx={{width:'100%', height:'100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative'}}
        // className={'demo-image-preview ' + classNameFullscreen}
        >
            <img src={dataUri} />
            <Box sx={{position:'absolute', bottom:'8%', width: '240px', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
            <Button variant='contained' onClick={()=>setDataUri(null)}>Retake</Button>
            <Button variant='contained' onClick={()=>setIsConfirm(true)}>Confirm</Button>
            </Box>

        </Box>
    );
};

ImagePreview.propTypes = {
    dataUri: PropTypes.string,
    isFullscreen: PropTypes.bool
};

export default ImagePreview;