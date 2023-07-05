import React, { useState, useEffect } from 'react'
// import Localbase from 'localbase'
import { CURRENCY } from '../../preset/preference'

import { CollectionPreferenceAPI, BEFORE_AFTER, FREQUENCY, PREFERENCE_ATTRIBUTES, frequencyLabelMapping } from '../../api/CollectionPreferenceAPI'
import { CollectionTuitionSetAPI } from '../../api/CollectionTuitionSetAPI'
import TuitionSetForm from '../../components/TuitionSetForm'

import {
    Container
    , FormControl
    , InputAdornment
    , List
    , ListItem
    , ListItemText
    , ListSubheader
    , MenuItem
    , OutlinedInput
    , Select
    , Switch
    , TextField
    , Typography
    , styled
    , Box
} from '@mui/material'
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import TimePicker from '@mui/lab/TimePicker';

import ReactCountryFlag from "react-country-flag"

import { pageHeader } from '../../components/commonStyle'
import PageFrame, { PAGES_NAME } from '../PageFrame'


function Preference() {

    const db_preference = new CollectionPreferenceAPI();
    const db_tuitionSet = new CollectionTuitionSetAPI();

    const [preferenceKey, setPreferenceKey] = useState();
    const [preference, setPreference] = useState()

    // For refreshing the state and re-render the page.
    const updateState = async () => {
        db_preference.getCollection().then(result => { setPreference(result[0].data); setPreferenceKey(result[0].key) })
    }

    const ListCurrency = () => CURRENCY.map(item => <option key={item.shortName} value={item.shortName} selected={(preference[PREFERENCE_ATTRIBUTES.CURRENCY] === item.shortName) ? true : false}>{item.fullName}</option>)
    // Object.keys(CURRENCY).map(item=><option value={item}>{CURRENCY[item]}</option>);

    const sectionColor = {
        pushNotification: '#E1E1E140',
        finance: '#CAE0D040',
        class: '#CACCE040',
        student: '#E0CACA40',
        outdoor: '#E0CACA40',
    }

    const sectionStyle = {
        borderRadius: '20px',
        paddingTop: '1px',
        paddingBottom: '1px',
        marginBottom: '10px',
    }

    // const init = async init)
    useEffect(() => {
        db_tuitionSet.initialize();
        updateState()
    }, [])

    useEffect(() => {
        db_preference.overwriteDocument(preferenceKey, preference);
    }, [preference])

    const TypeHeader = styled('h5')(({ theme }) => ({
        ...theme.typography.h6,
        marginLeft: '15px',
        marginBottom: '5px',
        // backgroundColor: theme.palette.background.paper,
        padding: '0px'

    }));


    return (
        preference !== undefined ? (
            <PageFrame pageName={PAGES_NAME.PREFERENCE}>


                <Container>
                    <Box sx={{ ...sectionStyle, backgroundColor: sectionColor.finance }}>
                        {/* ------------Finance------------- */}
                        <TypeHeader>Finance</TypeHeader>

                        <List sx={{ width: '100%', maxWidth: '100%' }}
                        // subheader={<ListSubheader sx={{background: 'none'}}>Finance</ListSubheader>}
                        >
                            {/* <ListItem>
                            <ListItemText id={PREFERENCE_ATTRIBUTES.FINANCE_REPORT} primary="Report" />
                            <Switch
                                edge='end'
                                checked={preference[PREFERENCE_ATTRIBUTES.FINANCE_REPORT]}
                                onChange={e => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.FINANCE_REPORT]: e.target.checked })}
                                inputProps={{ 'aria-labelledby': PREFERENCE_ATTRIBUTES.FINANCE_REPORT }}
                            />
                        </ListItem> */}

                            <ListItem>
                                <ListItemText id={PREFERENCE_ATTRIBUTES.CURRENCY} primary="Currency" />
                                <FormControl>
                                    <Select
                                        size='small'
                                        id={`select-${PREFERENCE_ATTRIBUTES.CURRENCY}`}
                                        value={preference[PREFERENCE_ATTRIBUTES.CURRENCY]}
                                        onChange={(e) => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.CURRENCY]: e.target.value })}
                                    >
                                        {CURRENCY.map(item => (
                                            <MenuItem key={item.shortName} value={item.shortName}><ReactCountryFlag countryCode={item.countryCode} svg /> &nbsp; {item.shortName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </ListItem>
                        </List>
                    </Box>

                    {/* --------Class--------- */}
                    <Box sx={{ ...sectionStyle, backgroundColor: sectionColor.class }}>
                        <TypeHeader>Class</TypeHeader>

                        <List sx={{ width: '100%', maxWidth: '100%' }}
                        // subheader={<ListSubheader sx={{background: 'none'}}>Class</ListSubheader>}
                        >

                            <ListItem>
                                <ListItemText id={PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY} primary="Default Frequency" />
                                <FormControl>
                                    <Select
                                        size='small'
                                        id={`select-${PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY}`}
                                        value={preference[PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY]}
                                        onChange={(e) => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.CLASS_FREQUENCY]: e.target.value })}
                                    >
                                        {frequencyLabelMapping.map(item => (
                                            <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </ListItem>

                            <ListItem>
                                <ListItemText id={PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN} primary="Default Duration" />
                                <FormControl variant="outlined">
                                    <OutlinedInput
                                        size='small'
                                        id={`input-${PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN}`}
                                        value={preference[PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN]}
                                        onChange={e => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN]: e.target.value })}
                                        endAdornment={<InputAdornment position="end">min</InputAdornment>}
                                        sx={{ width: 95 }}
                                        inputProps={{
                                            'aria-label': PREFERENCE_ATTRIBUTES.CLASS_DURATION_MIN,
                                        }}
                                    />
                                </FormControl>
                            </ListItem>
                        </List>
                    </Box>

                    {/* <Box sx={{ ...sectionStyle, backgroundColor: sectionColor.student }}>

                    <List sx={{ width: '100%', maxWidth: '100%' }}
                    // subheader={<ListSubheader sx={{background: 'none'}}>Outdoor Functions</ListSubheader>}
                    >
                        <TypeHeader>Outdoor Functions</TypeHeader>

                        <ListItem>
                            <ListItemText id={PREFERENCE_ATTRIBUTES.WEATHER_FORECASTING} primary="Weather forecast" />
                            <Switch
                                edge='end'
                                checked={preference[PREFERENCE_ATTRIBUTES.WEATHER_FORECASTING]}
                                onChange={e => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.WEATHER_FORECASTING]: e.target.checked })}
                                inputProps={{ 'aria-labelledby': PREFERENCE_ATTRIBUTES.WEATHER_FORECASTING }}
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemText id={PREFERENCE_ATTRIBUTES.PATH_ADVISOR} primary="Path advisor" />
                            <Switch
                                edge='end'
                                checked={preference[PREFERENCE_ATTRIBUTES.PATH_ADVISOR]}
                                onChange={e => setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.PATH_ADVISOR]: e.target.checked })}
                                inputProps={{ 'aria-labelledby': PREFERENCE_ATTRIBUTES.PATH_ADVISOR }}
                            />
                        </ListItem>
                    </List>
                </Box > */}

                </Container>
            </PageFrame>
        ) : (<div>Loading...</div>)
    )
}

export default Preference