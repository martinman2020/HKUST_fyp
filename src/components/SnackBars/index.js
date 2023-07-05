import React from 'react'
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import PropTypes from 'prop-types';
import Slide, { SlideProps } from '@mui/material/Slide';

export const initSnackBarsOption = {
    isShow: false
    ,type: 'info'
    , message: 'Not set'
}

function TransitionDown(props) {
    return <Slide {...props} direction="down" />;
}

function SnackBars({ type, isShow, message, onClose }) {
    return (
        <Snackbar
            open={isShow}
            autoHideDuration={5000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            TransitionComponent={TransitionDown}
        >
            <Alert onClose={onClose} severity={type} sx={{ width: '100%' }}>
                <span style={{fontWeight:600}}>{message}</span>
            </Alert>

        </Snackbar>
    )
}

SnackBars.propTypes = {
    type: PropTypes.oneOf(['info', 'error', 'warning', 'success']),
    isShow: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
}

export default SnackBars