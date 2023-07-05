import { Box, Button, Container, Dialog, FormControl, Grid, IconButton, InputLabel, MenuItem, NativeSelect, Select, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import SettingsIcon from '@mui/icons-material/Settings';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES, presetPreference } from '../../api/CollectionPreferenceAPI';
import PopupDialogFrame from '../PopupDialogFrame'

const labelSet = [
  '01:00', '01:30'
  , '02:00', '02:30'
  , '03:00', '03:30'
  , '04:00', '04:30'
  , '05:00', '05:30'
  , '06:00', '06:30'
  , '07:00', '07:30'
  , '08:00', '08:30'
  , '09:00', '09:30'
  , '10:00', '10:30'
  , '11:00', '11:30'
  , '12:00', '12:30'
  , '13:00', '13:30'
  , '14:00', '14:30'
  , '15:00', '15:30'
  , '16:00', '16:30'
  , '17:00', '17:30'
  , '18:00', '18:30'
  , '19:00', '19:30'
  , '20:00', '20:30'
  , '21:00', '21:30'
  , '22:00', '22:30'
  , '23:00', '23:30'
]

const valueSet = [
  '1', '1.5',
  '2', '2.5',
  '3', '3.5',
  '4', '4.5',
  '5', '5.5',
  '6', '6.5',
  '7', '7.5',
  '8', '8.5',
  '9', '9.5',
  '10', '10.5',
  '11', '11.5',
  '12', '12.5',
  '13', '13.5',
  '14', '14.5',
  '15', '15.5',
  '16', '16.5',
  '17', '17.5',
  '18', '18.5',
  '19', '19.5',
  '20', '20.5',
  '21', '21.5',
  '22', '22.5',
  '23', '23.5',
]

const TIME_RANGE_MIN_INTERVAL = 5;

function ClassSchedulerSettingBtn({ refreshToggle, setRefreshToggle }) {

  const db_preference = new CollectionPreferenceAPI();

  const [isOpen, setIsOpen] = useState(false);
  const [preference, setPreference] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    db_preference.getPreference().then(data => {

      // If there are no display time attributes:
      if (!data[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM] || !data[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]) {
        let presetFrom = presetPreference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]
        let presetTo = presetPreference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]

        db_preference.setAttributeByObject({
          [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: presetFrom
          , [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: presetTo
        }).then(res => {
          setPreference({
            ...data,
            [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: presetFrom
            , [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: presetTo
          })
        })
      } else {
        // If the preference include these two attributes.
        setPreference(data)
      }

    });
  }, [])

  const validateSelectedTime = (changingAttribute, value) => {
    if (changingAttribute === PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM) {
      // console.log('FROM')
      if (parseFloat(value) >= parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO])
        || (parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO] - parseFloat(value)) < TIME_RANGE_MIN_INTERVAL)) {
        return false
      }
    } else {
      // console.log('TO')
      // console.log('parseFloat(value) <= parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM])',parseFloat(value) <= parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]))
      if (
        parseFloat(value) <= parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM])
        || (parseFloat(value) - parseFloat(preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]) < TIME_RANGE_MIN_INTERVAL)
      ) {
        return false
      }
    }

    return true
  }

  const handleDisplayFromSelectChange = (e) => {
    if (validateSelectedTime(PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM, e.target.value) === false) {
      setIsError(true);
    } else {
      setIsError(false)
      setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]: e.target.value })
      db_preference.setAttribute(PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM, e.target.value)
      // .then(res => console.log(res))
    }
  }

  const handleDisplayToSelectChange = (e) => {
    if (validateSelectedTime(PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO, e.target.value) === false) {
      setIsError(true);
    } else {
      setIsError(false)
      setPreference({ ...preference, [PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]: e.target.value })
      db_preference.setAttribute(PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO, e.target.value)
      // .then(res => console.log(res))
    }
  }

  const handleChangeSchedulerDefaultView = (e) => {
    db_preference.setAttribute(PREFERENCE_ATTRIBUTES.DEFAULT_SCHEDULER_VIEW, e.target.value)
    setPreference({...preference, [PREFERENCE_ATTRIBUTES.DEFAULT_SCHEDULER_VIEW]: e.target.value})
  }

  const handleCloseDialog = (e) => {
    setRefreshToggle(!refreshToggle)
    setIsOpen(false)
  }

  const MenuTitle = ({title, description}) => (
    <Grid item xs={12} sx={{ paddingBottom: '15px' }}>
      <Typography sx={{ fontWeight: '700', fontSize: '1.1em' }}>{title}</Typography>
      <Typography sx={{ fontWeight: '400', fontSize: '0.8em', color: '#555' }}>{description}</Typography>
    </Grid>
  )


  return (
    <>
      {preference ? (
        <>
          {/* <Dialog open={isOpen}
            onClose={(event, reason) => {
              // Prevent close on clicking the backdrop
              if (reason && reason == 'backdropClick')
                return;
              setIsOpen(false)
            }}

            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          > */}

          <PopupDialogFrame isOpen={isOpen} title={'Scheduler Setting'} onClose={handleCloseDialog} >

            <Stack spacing={2}>
              {/* Time Range of the Scheduler */}
              <Container>
                <Grid container sx={{ border: '1px #AAA solid', padding: '10px', borderRadius: '5px' }}>
                  <MenuTitle title='Display Time Range' description='The time range that used on the scheduler (*need refresh the page)' />

                  <Grid item xs={12} sx={{ display: 'flex', direction: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end' }}>
                    From

                    <FormControl>
                      <InputLabel variant="standard" htmlFor="uncontrolled-native">
                        Time
                      </InputLabel>
                      <NativeSelect
                        value={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_FROM]}
                        onChange={handleDisplayFromSelectChange}
                        inputProps={{
                          name: 'Display scheduler time from',
                          id: 'timeFrom',
                        }}
                      >
                        {labelSet.map((element, i) => (
                          <option value={valueSet[i]} key={`from-${valueSet[i]}`}>{labelSet[i]}</option>
                        ))}

                      </NativeSelect>
                    </FormControl>

                    to

                    <FormControl>
                      <InputLabel variant="standard" htmlFor="uncontrolled-native">
                        Time
                      </InputLabel>
                      <NativeSelect
                        value={preference[PREFERENCE_ATTRIBUTES.CLASS_SCHEDULER_TIME_DISPLAY_TO]}
                        onChange={handleDisplayToSelectChange}
                        inputProps={{
                          name: 'Display scheduler time to',
                          id: 'timeTo',
                        }}
                      >
                        {labelSet.map((element, i) => (
                          <option value={valueSet[i]} key={`to-${valueSet[i]}`}>{labelSet[i]}</option>
                        ))}

                      </NativeSelect>
                    </FormControl>
                  </Grid>

                  <Typography sx={{ fontWeight: '400', fontSize: '0.8em', color: 'red', padding: '10px', display: isError ? 'block' : 'none' }} >The start time must be earlier than the end time, and the interval of time range must exceed {TIME_RANGE_MIN_INTERVAL} hours.</Typography>
                </Grid>
              </Container>

              {/* Default View of Scheduler */}
              <Container>
                <Grid container sx={{ border: '1px #AAA solid', padding: '10px', borderRadius: '5px' }}>
                <MenuTitle title='Default Scheduler View' description='The view of the scheduler (*need refresh the page)' />

                  <Grid item xs={12} sx={{ display: 'flex', direction: 'row', justifyContent: 'space-evenly', alignItems: 'flex-end' }}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">Default</InputLabel>
                      <Select
                        labelId="default-view-label"
                        id="default-view-select"
                        value={preference[PREFERENCE_ATTRIBUTES.DEFAULT_SCHEDULER_VIEW]}
                        label="Default"
                        onChange={handleChangeSchedulerDefaultView}
                      >
                        <MenuItem value={'Day'}>Day</MenuItem>
                        <MenuItem value={'Week'}>Week</MenuItem>
                        <MenuItem value={'Month'}>Month</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Typography sx={{ fontWeight: '400', fontSize: '0.8em', color: 'red', padding: '10px', display: isError ? 'block' : 'none' }} >The start time must be earlier than the end time, and the interval of time range must exceed {TIME_RANGE_MIN_INTERVAL} hours.</Typography>
                </Grid>
              </Container>


            </Stack>
          </ PopupDialogFrame>

          {/* </Dialog> */}
        </>
      )
        : <></>}

      <>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            fontSize: '2.3em',
          }}
          size="large"
        >
          <SettingsIcon htmlColor='#FFF' sx={{
            fontSize: '1em'
          }} />
        </IconButton>
      </>

    </>
  )
}

export default ClassSchedulerSettingBtn