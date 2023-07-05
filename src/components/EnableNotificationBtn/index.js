import { Button } from '@mui/material'
import React, { useEffect } from 'react'

function EnableNotificationBtn() {

    useEffect(() => {
        if ('Notification' in window) {
            console.log('This browser support Notification, and the notification permission state is :', Notification.permission)
        }
    })

    const displayNotification = (timestamp)=>{
        if('serviceWorker' in navigator){
            let options = {
                tag:'',
                body: 'You have been subscribed!',
                // icon: '',
                // image: '',
                dir: 'ltr', // left to right 
                lang: 'en-US',
                // vibrate: [100,50,200], // in ms
                // showTrigger: new TimestampTrigger(timestamp + 30 * 1000)
                // badge: ''
            }

            // new Notification('Successfully subscribed!',options)
            navigator.serviceWorker.ready.then(swreg=>{
                let n1 = setTimeout(()=>{
                    swreg.showNotification('Successfully subscribed (from SW)!', options)
                })
                

                let n2 = setTimeout(()=>{
                    swreg.showNotification('Successfully subscribed2 (from SW)!', options)
                },10000)

                
            })
        }
        
    }

    const askForNotificationPermission = () => {
        Notification.requestPermission((res)=>{
            console.log('User Choice,', res);
            if(res !== 'granted'){
                console.log('No notification permission granted!')
            }else{
                // TO BE CONTINUOUS
                displayNotification();
            }
        });
    }

    return (
        <>
            <Button variant='contained' onClick={askForNotificationPermission}>Enable Notification</Button>
        </>
    )
}

export default EnableNotificationBtn