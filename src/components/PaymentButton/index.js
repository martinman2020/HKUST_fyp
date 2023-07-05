import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { TuitionPayForm, tuitionPayOptionInitObj, TUITION_PAY_OPTION_ATTR } from '../TuitionPayForm'
import SnackBars, { initSnackBarsOption } from '../SnackBars'


export default function PaymentButton({ studentKey, studentName, classKey, refresh, isRefresh, setIsRefresh, parentRefresh, setParentRefresh }) {
    const [tuitionPayOption, setTuitionPayOption] = useState(tuitionPayOptionInitObj)
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isSubmitted) {
            if (refresh) {
                console.log('refreshing')
                refresh()
            }
            if (isRefresh !== null && setIsRefresh   ) {
                setIsRefresh(!isRefresh)
            }
            setIsSubmitted(false)
        }
    }, [isSubmitted])


    // handle Pay Tuition
    // checkout tuitionPayOptionInitObj
    const handlePayTuition = (obj) => {
        setTuitionPayOption(obj)
    }

    const PayButton = () => (
        <Button
            variant="contained"
            color="primary"
            onClick={(event) => {
                handlePayTuition({
                    [TUITION_PAY_OPTION_ATTR.IS_OPEN]: true,
                    [TUITION_PAY_OPTION_ATTR.STUDENT_KEY]: studentKey,
                    [TUITION_PAY_OPTION_ATTR.STUDENT_NAME]: studentName,
                    [TUITION_PAY_OPTION_ATTR.CLASS_KEY]: classKey
                })
            }}
        >
            RESOLVED
        </Button>
    )

    return (
        <>
            <TuitionPayForm 
                openOptions={tuitionPayOption} 
                setOpenOptions={setTuitionPayOption} 
                isSubmitted={isSubmitted} 
                setIsSubmitted={setIsSubmitted} 
                parentRefresh={parentRefresh} 
                setParentRefresh={setParentRefresh}
            />
            <PayButton />
        </>
    )
}
