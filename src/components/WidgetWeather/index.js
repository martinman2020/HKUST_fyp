import React, { useEffect, useState } from 'react'
import ReactWeather, { useOpenWeather } from 'react-open-weather';
import Geocode from 'react-geocode'
import { Typography } from '@mui/material';
import { lime } from '@mui/material/colors';
import WidgetFrame from '../WidgetFrame';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box } from '@mui/system';

function WidgetWeather() {

    const openWeatherAPIKey = '5cfb951d54729d8a010a709f1bcdbe0d';
    const geoCodeAPIKey = 'AIzaSyCQq4WHbh0Y_ksJHWX58ZiSy8GYq94xhLs';

    Geocode.setApiKey(geoCodeAPIKey)
    Geocode.setLanguage('en')
    Geocode.enableDebug()

    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [locationStateName, setlocationStateName] = useState(null);


    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                console.log('position is :', position)
                console.log("Latitude is :", position.coords.latitude);
                console.log("Longitude is :", position.coords.longitude);
                Geocode.fromLatLng(position.coords.latitude, position.coords.longitude).then(response => {
                    const address = response.results[0].formatted_address;
                    let city, state, country;
                    for (let i = 0; i < response.results[0].address_components.length; i++) {
                        for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                            switch (response.results[0].address_components[i].types[j]) {
                                case "locality":
                                    city = response.results[0].address_components[i].long_name;
                                    break;
                                case "administrative_area_level_1":
                                    state = response.results[0].address_components[i].long_name;
                                    break;
                                case "country":
                                    country = response.results[0].address_components[i].long_name;
                                    break;
                            }
                        }
                    }
                    // console.log('address:',address)
                    // console.log('city:',city)
                    // console.log('state:',state)
                    // console.log('country:',country)
                    setlocationStateName(state)
                }
                )

                setLatitude(position.coords.latitude)
                setLongitude(position.coords.longitude)
            });
        } else {
            console.log('geolocation not available')
        }
    }, [])

    const { data, isLoading, errorMessage } = useOpenWeather({
        key: openWeatherAPIKey,
        lat: latitude,
        lon: longitude,
        lang: 'en',
        unit: 'metric', // values are (metric, standard, imperial)
    });

    let locationFailWarningMessage = 'Please enable the location to activate this widget. ',
    connectionFailWarningMessage = 'Please keep the connection and maintain the connection stable to activate this widget.'

    const WarningWidgetFrame = ({message}) => (
        <WidgetFrame
            background={lime[100]}
            titleText='weather forecasting'
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center'
            }}
            >

                <WarningAmberIcon
                    sx={{ margin: '10px', color: lime[700] }}
                />

                <Typography sx={{ fontWeight: 700, color: lime[900] }}>{message}</Typography>
            </Box>
        </WidgetFrame>
    )

    return (
        <>
            {!window.navigator.onLine
                ? (<>
                    <WarningWidgetFrame message={connectionFailWarningMessage} />
                </>)
                : <>{(longitude && latitude) ? (
                    <ReactWeather
                        isLoading={isLoading}
                        errorMessage={errorMessage}
                        data={data}
                        lang="en"
                        locationLabel={locationStateName}
                        unitsLabels={{ temperature: '°C', windSpeed: 'Km/h' }}
                        showForecast={true}
                    />
                ) : (
                    // If the device cannot get the longitude & latitude
                    <WarningWidgetFrame message={locationFailWarningMessage} />
                )}</>
            }

        </>
    )
}

export default WidgetWeather