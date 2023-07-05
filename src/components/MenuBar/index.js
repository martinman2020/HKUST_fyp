import { React, useState } from 'react'
import { Link } from 'react-router-dom'

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ClassIcon from '@mui/icons-material/Class';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaidIcon from '@mui/icons-material/Paid';
import SettingsIcon from '@mui/icons-material/Settings';


export default function MenuBar() {

    // please add the path object here with following structure
    const paths = [
        { label: 'Home', path: '/', icon: <HomeIcon /> },
        { label: 'Student', path: '/student', icon: <PeopleAltIcon /> },
        { label: 'Class', path: '/class', icon: <ClassIcon /> },
        { label: 'Finance', path: '/finance', icon: <PaidIcon /> },
        { label: 'Preference', path: '/preference', icon: <SettingsIcon /> }

    ]

    const [selectedPage, setSelectedPage] = useState(paths.findIndex(obj => {
        return obj.path === window.location.pathname
    }));

    return (
        <>
            {window.location.pathname.split('/')[1] === 'card' ? null :
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={selectedPage}
                        onChange={(event, newValue) => {
                            // console.log('BottomNavigation value,', newValue )
                            setSelectedPage(newValue);  // set the selectedPage state, and trigger the useEffect above.
                        }}
                    >
                        {paths.map(item => (
                            <BottomNavigationAction
                                key={item.label}
                                component={Link}
                                label={item.label}
                                to={item.path}
                                icon={item.icon}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            }
        </>
    )
}