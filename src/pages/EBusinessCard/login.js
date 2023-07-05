import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI';
import { EbusinessCardAPI } from '../../api/EbusinessCardAPI';
import { CircularProgress } from '@mui/material';


function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://flb.vercel.app/">
                FL Buddy
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

function Login() {

    const db_preference = new CollectionPreferenceAPI();

    const [errorMsg, setErrorMsg] = React.useState({ message: '', color: '#e00' })

    const [isLoading, setIsLoading] = React.useState(false)
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setIsLoading(true)

        EbusinessCardAPI.login({
            email: data.get('email'),
            password: data.get('password'),
        }).then((res) => {
            if (res.data.user === true) {
                setErrorMsg({ message: "", color: '#e00' })
                let userId = res.data.userId
                db_preference.setAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID, userId).then(() => {
                    window.location.assign('/ebusinesscard')
                })
            } else {
                setErrorMsg({ message: "* Incorrect email or password, please try again", color: '#e00' })
            }
            setIsLoading(false)
        })


    };

    React.useEffect(() => {
        db_preference.getAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID).then(res => {
            if (res) window.location.assign('/eBusiness')
        })
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />

                        <Typography sx={{
                            color: errorMsg.color,
                            fontWeight: '600',
                            fontSize: '0.8em'
                        }}>{errorMsg.message}</Typography>
                        {/* <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        /> */}
                        <Box
                            sx={{
                                position: 'relative'
                            }}>
                            <Button
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            {isLoading && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: '#1565c0',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            )}

                        </Box>
                        <Grid container>
                            {/* <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid> */}
                            <Grid item>
                                <Link href="/ebusinesscard/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </ThemeProvider>
    );
}

export default Login