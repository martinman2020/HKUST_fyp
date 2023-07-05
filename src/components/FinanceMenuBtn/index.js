import React, { useState, useEffect } from 'react'
import ListIcon from '@mui/icons-material/List';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    InputLabel,
    Menu,
    MenuItem,
    FormControl,
    Select,
    TextField,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    Button,
    Stack,
    styled,
    Paper,
    Grid,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings';


function FinaceMenuBtn () {
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const navigate = useNavigate();

    const handleMenuClick = (e) => {
        setAnchorEl(e.target);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    };  

    const directIncomeCatPage = () => {
        navigate("/income_category_page");
    }

    const directExpenseCatPage = () => {
        navigate("/expense_category_page");
    }

    const directChartPage = () => {
        navigate("/financeChart");
    }

    return (
        <>
            <IconButton 
                size="large"
                id="financeMenuBtn"
                aria-controls={menuOpen ? 'demo-positioned-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={(e) => handleMenuClick(e)}
                color="inherit"
                sx={{
                    fontSize:'2.3em'
                }}
            >
                <SettingsIcon htmlColor='#FFF' sx={{
                    fontSize:'1em'
                }}/>
            </IconButton>
            <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={() => handleMenuClose()}
                // anchorOrigin={{
                // vertical: 'top',
                // horizontal: 'left',
                // }}
                // transformOrigin={{
                // vertical: 'top',
                // horizontal: 'left',
                // }}
            >
                <MenuItem onClick={() => directIncomeCatPage()}><b>Income Category Setting</b></MenuItem><hr />
                <MenuItem onClick={() => directExpenseCatPage()}><b>Expense Category Setting</b></MenuItem>
                {/* <MenuItem onClick={() => directChartPage()}><b>Finance Report</b></MenuItem> */}
                {/* <MenuItem onClick={() => directChartPage()}>Logout</MenuItem> */}
            </Menu>
        
        </>
    )



}

export default FinaceMenuBtn

