import React from 'react'
import { Box, Button, Container, Dialog, IconButton, Typography } from '@mui/material';
import { commonStyle_centeredBoxOnTheTopest } from '../commonStyle';

import CloseIcon from '@mui/icons-material/Close';

function PopupDialogFrame({ children, closeOnBackdropClick = false, isOpen, onClose, title = "Not Set", onSubmit, submitBtnText = "Submit", closeBtnText = "Close" }) {
    return (
        <Dialog open={isOpen}
            onClose={(event, reason) => {
                // Prevent close on clicking the backdrop
                if (closeOnBackdropClick && reason && reason == 'backdropClick')
                    return;
                onClose()
            }}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Box sx={{ ...commonStyle_centeredBoxOnTheTopest, paddingBottom: '25px' }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    boxShadow: '2px -2px 5px #eee',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    borderBottom: '2px #eee solid',
                    marginBottom: '20px',
                }}>
                    <Typography component={'h2'} sx={{
                        fontWeight: '900',
                        fontSize:'1.2em',
                        marginLeft: '20px',
                        color: 'gray'
                    }}
                    >{title}</Typography>

                    <IconButton
                        onClick={onClose}
                        sx={{ marginRight: '20px', }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Container>
                    {children}

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-evenly',
                            paddingTop: '25px',
                            paddingBottom: '10px',
                        }}
                    >
                        {onSubmit ? (
                            <Button variant='contained' onClick={onSubmit}>{submitBtnText}</Button>
                        ) : null}
                        {
                            onClose ? (
                                <Button variant='outlined' onClick={onClose}>{closeBtnText}</Button>

                            ) : null
                        }
                    </Box>
                </Container>
            </Box>
        </Dialog>
    )
}

export default PopupDialogFrame