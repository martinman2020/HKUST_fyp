import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress, FormControl, IconButton, InputLabel, MenuItem, Select, Stack } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { EbusinessCardAPI } from '../../api/EbusinessCardAPI';
import SnackBars, { initSnackBarsOption } from '../../components/SnackBars';
import { CollectionPreferenceAPI, PREFERENCE_ATTRIBUTES } from '../../api/CollectionPreferenceAPI';
import LoadingPage from '../../components/LoadingPage';
import resizeImage from '../../common/resizeImage'
import getImageDimensions from '../../common/getImageDim';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Freelancer Buddy
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const theme = createTheme();

const GENDER = [
    { value: 'm', label: 'Male' }
    , { value: 'f', label: 'Female' }
    , { value: 'n', label: 'None' }
]

const MutiStringField = ({ arr, setArr, field, setField, fieldName, fieldLabel, listLabel, borderColor = '#eee' }) => (
    <Grid item xs={12} sx={{
        display: 'flex',
        alignItems: 'center',
    }}>

        <Grid container
            sx={{
                border: `1px solid ${borderColor}`,
                borderRadius: '5px',
                padding: '5px',
            }}
        >
            <Grid item xs={10}>
                <TextField
                    multiline
                    maxRows={3}
                    fullWidth
                    name={fieldName}
                    id={fieldName}
                    label={fieldLabel}
                    value={field}
                    onChange={(e) => { setField(e.target.value) }}
                />
            </Grid>


            <Grid item xs={2}>
                <IconButton onClick={() => {
                    if (field.trim() !== '') setArr([...arr, field.trim()])
                    setField('')
                }}>
                    <AddIcon fontSize='large' color='info' />
                </IconButton>
            </Grid>



            <Grid item xs={12}>
                <Typography
                    component='h3'
                    sx={{
                        fontWeight: 600,
                        fontSize: '0.9em',
                        paddingLeft: '2px',
                        paddingTop: '10px',
                        paddinBottom: '5px',
                        color: '#777',
                        textDecoration: 'underline'
                    }}
                >{listLabel}</Typography>

                <Stack spacing={1}>
                    {arr.map((item, index) =>
                        <div
                            key={`${item} ${index}`}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                            <IconButton
                                onClick={() => setArr(arr.filter(_item => _item !== item))}
                            >
                                <DeleteIcon color='error' />
                            </IconButton>
                            <Typography key={`service-${item}`}>{item}</Typography>

                        </div>
                    )}
                </Stack>
            </Grid>
        </Grid>
    </Grid>
)


const contactMethods = [
    { label: 'Phone', value: 'phone' },
    { label: 'E-mail', value: 'email' },
    { label: 'Whatsapp', value: 'whatsapp' },
    { label: 'Signal', value: 'signal' },
]


const ContactField = ({ arr, setArr, field, setField }) => {

    return (
        <Grid item xs={12} sx={{
            display: 'flex',
            alignItems: 'center',
        }}>
            <Grid container
                sx={{
                    border: `1px solid #eee`,
                    borderRadius: '5px',
                    padding: '5px',
                    alignItems: 'center',
                }}
            >
                <Grid item xs={4}>
                    <FormControl fullWidth variant="filled" sx={{
                        paddingRight: '5px',
                    }}>
                        <InputLabel id="contact-input-label">Option</InputLabel>
                        <Select
                            labelId="contact-select-label"
                            id="contact-select-filled"
                            value={field.type}
                            label={'Contact option'}
                            onChange={(e) => setField({ ...field, type: e.target.value })}
                        >
                            {contactMethods.filter(item => !arr.map(_item => _item.type).includes(item.value)).map(item => <MenuItem key={`${item.value}`} value={item.value}>{item.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        multiline
                        maxRows={3}
                        fullWidth
                        name={`contact-value`}
                        id={`contact-value`}
                        label={`Contact`}
                        value={field.value}
                        onChange={(e) => { setField({ ...field, value: e.target.value }) }}
                    />
                </Grid>


                <Grid item xs={2}>
                    <IconButton onClick={() => {
                        if (field.value.trim() !== '') setArr([...arr, { type: field.type, value: field.value.trim() }])

                        setField({ type: '', value: '' })
                    }}>
                        <AddIcon fontSize='large' color='info' />
                    </IconButton>
                </Grid>



                <Grid item xs={12}>
                    <Typography
                        component='h3'
                        sx={{
                            fontWeight: 600,
                            fontSize: '0.9em',
                            paddingLeft: '2px',
                            paddingTop: '10px',
                            paddinBottom: '5px',
                            color: '#777',
                            textDecoration: 'underline'
                        }}
                    >Added Contacts</Typography>

                    <Stack spacing={1}>
                        {arr.map((item, index) =>
                            <div
                                key={`contact${index}`}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                <IconButton
                                    onClick={() => setArr(arr.filter(_item => _item.type !== item.type))}
                                >
                                    <DeleteIcon color='error' />
                                </IconButton>
                                <Typography key={`service-${item}`}>{item.type} : {item.value}</Typography>
                            </div>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </Grid>
    )
}


export default function SignUp({ isEdit }) {

    const db_preference = new CollectionPreferenceAPI();

    const [eBusinessCardId, setEBusinessCardId] = React.useState(null);

    const [showFullForm, setShowFullForm] = React.useState(false)

    const [formEditData, setFormEditData] = React.useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        repassword: '',
        title: '',
        gender: 'n',
        introduction: '',
    });

    const [isLoading, setIsLoading] = React.useState(isEdit)

    const [service, setService] = React.useState([]);
    const [serviceField, setServiceField] = React.useState('');

    const [experience, setExperience] = React.useState([])
    const [experienceField, setExperienceField] = React.useState('');

    const [award, setAward] = React.useState([])
    const [awardField, setAwardField] = React.useState('');

    const [contact, setContact] = React.useState([])
    const [contactField, setContactField] = React.useState({ type: '', value: '' });

    const [imageUri, setImageUri] = React.useState(null)
    const [imageDim, setimageDim] = React.useState({w: null, h:null}) 

    const [snackBarOption, setSnackBarOption] = React.useState(initSnackBarsOption)

    React.useEffect(() => {
        db_preference.getAttribute(PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID).then((value) => {
            if (isEdit) {
                if (!value) window.location.assign('/ebusinessCard/signup')
                setEBusinessCardId(value);
                EbusinessCardAPI.fetchCardById(value).then((res) => {
                    console.log(res.data)
                    let data = res.data
                    setFormEditData({
                        _id: data._id,
                        password: '',
                        repassword: '',
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        gender: data.gender,
                        introduction: data.introduction,
                        title: data.title
                    })
                    setService(data.service)
                    setAward(data.award)
                    setExperience(data.experience)
                    setContact(data.contact)
                    setImageUri(data.selectedFile)
                    setIsLoading(false)
                })

            } else {
                if (value) window.location.assign('/ebusinessCard')
            }
        })
    }, [])

    React.useEffect(()=>{
        if(imageUri){
            getImageDimensions(imageUri).then(res=>{
                console.log(res)
                setimageDim(res)
            })
        }
    },[imageUri])


    const textFieldShrink = isEdit ? { shrink: true } : {}

    const [emailExistedMsg, setEmailExistedMsg] = React.useState({ exsited: false, message: 'The email is existed, please try another email.' })
    const [passwordErrorMsg, setPasswordErrorMsg] = React.useState({ error: false, message: 'Two inputed password are different, please try again.' })
    
    

    const validateFormDate = () => {
        let option = { isShow: true, type: 'error' }
        if (formEditData.firstName.trim().length === 0 || formEditData.lastName.trim().length === 0) {
            setSnackBarOption({ ...option, message: 'Please fill in the first name and last name' })
            return false;
        }

        if (formEditData.email.trim().length === 0 || !formEditData.email.includes('@') || !formEditData.email.includes('.')) {
            setSnackBarOption({ ...option, message: 'Please fill in the email with appropriate format "example@mail.com" ' })
            return false;
        }

        if (!isEdit && (formEditData.password.length < 8 || formEditData.repassword.length < 8)) {
            setSnackBarOption({ ...option, message: 'The password has at least 8 characters.' })
            return false;
        }

        if (!isEdit && (formEditData.password !== formEditData.repassword)) {
            setSnackBarOption({ ...option, message: 'The passwords confirmation are different, please check your password.' })
            return false;
        }

        if (isEdit && (formEditData.password.length > 0 || formEditData.repassword.length > 0)) {
            if (formEditData.password.length < 8 || formEditData.repassword.length < 8) {
                setSnackBarOption({ ...option, message: 'The password has at least 8 characters.' })
                return false;
            }

            if (formEditData.password !== formEditData.repassword) {
                setSnackBarOption({ ...option, message: 'The passwords confirmation are different, please check your password.' })
                return false;
            }
        }

        return true
    }

    const [isSubmitLoading, setIsSubmitLoading] = React.useState(false);
    const handleSubmit = (event) => {
        const data = new FormData(event.currentTarget);
        event.preventDefault();
        if (!validateFormDate()) return
        setIsSubmitLoading(true);
        // data.set('contact', contact);
        // data.set('award', award);
        // data.set('experience', experience);
        // data.set('contact', contact);
        EbusinessCardAPI.checkEmail({ email: data.get('email') }).then((res) => {
            let { exsited } = res.data
            // console.log(res.data)

            setIsSubmitLoading(false)
            // Validate the exsitance of the email
            setEmailExistedMsg({ ...emailExistedMsg, exsited })
            if (exsited) return

            // Validate the two inputed password are same
            // if (!validatePassword(data.get('password'), data.get('repassword'))) return


            // Submition process
            const sumbitedData = {
                email: data.get('email'),
                password: data.get('password'),
                title: data.get('title'),
                firstName: data.get('firstName'),
                lastName: data.get('lastName'),
                gender: data.get('gender'),
                selectedFile: imageUri,
                introduction: data.get('introduction'),
                service: service,
                experience: experience,
                award: award,
                contact: contact,
                lastModifiedAt: new Date()
            }

            // console.log(sumbitedData);


            EbusinessCardAPI.createCard(sumbitedData).then((res) => {
                // console.log('the result is ',res)
                // console.log('the id is ', res.data['_id']);
                let cardIdInDatabase = res.data['_id']

                if (res.status === 200) {
                    db_preference.setAttributeByObject({ [PREFERENCE_ATTRIBUTES.E_BUSINESS_CARD_ID]: cardIdInDatabase }).then(() => {
                        setIsSubmitLoading(true);
                        setSnackBarOption({ isShow: true, type: 'success', message: 'Your business card is created' })
                        window.location.assign("/ebusinessCard")
                    })
                } else {
                    setIsSubmitLoading(true);
                    setSnackBarOption({ isShow: true, type: 'error', message: 'Fail to create your business card, please contact us.' })
                }
            })
        })




    };

    const [isUpdateLoading, setIsUpdateLoading] = React.useState(false)
    const handleUpdate = (event) => {
        event.preventDefault();
        if (!validateFormDate()) return
        setIsUpdateLoading(true)
        const password = formEditData.password,
            repassword = formEditData.repassword

        let updateData = {
            _id: formEditData._id,
            email: formEditData.email,
            title: formEditData.title,
            firstName: formEditData.firstName,
            lastName: formEditData.lastName,
            gender: formEditData.gender,
            selectedFile: imageUri,
            introduction: formEditData.introduction,
            service: service,
            experience: experience,
            award: award,
            contact: contact,
            lastModifiedAt: new Date()
        }

        if (password.length > 0 || repassword.length > 0) {
            updateData = { ...updateData, password: password }
        }

        EbusinessCardAPI.updateCard(updateData).then((res) => {
            console.log('Received information:', res)
            setIsUpdateLoading(false)
            setSnackBarOption({ isShow: true, type: 'success', message: res.data.message })
            window.location.assign("/ebusinessCard")
        })


    }


    const handleFileRead = async (event) => {
        const file = event.target.files[0]
        console.log(file);
        // const base64 = await convertBase64(file)
        resizeImage(file).then(res=>{
            setImageUri(res)
        console.log(res)
        })
        // setImageUri(base64)
        // console.log(base64)
    }

    const handleCloseSnackBars = () => {
        setSnackBarOption({ ...snackBarOption, isShow: false })
    }

    return (
        <>
            <SnackBars  {...snackBarOption} onClose={handleCloseSnackBars} />

            {isEdit && isLoading ? (<LoadingPage title="Fetching card data" description='Please wait a moment' />) :
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
                                {isEdit ? "Update":"Create"} your e-business card
                            </Typography>

                            {/* email/ password */}
                            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            autoComplete="given-name"
                                            name="firstName"
                                            required
                                            fullWidth
                                            id="firstName"
                                            label="First Name"
                                            autoFocus

                                            InputLabelProps={textFieldShrink}
                                            value={formEditData.firstName}
                                            onChange={(e) => setFormEditData({ ...formEditData, firstName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="lastName"
                                            label="Last Name"
                                            name="lastName"
                                            autoComplete="family-name"

                                            InputLabelProps={textFieldShrink}
                                            value={formEditData.lastName}
                                            onChange={(e) => setFormEditData({ ...formEditData, lastName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="email"
                                            label="Email Address"
                                            name="email"
                                            autoComplete="email"

                                            disabled={isEdit}
                                            InputLabelProps={textFieldShrink}
                                            value={formEditData.email}
                                            onChange={(e) => setFormEditData({ ...formEditData, email: e.target.value })}
                                        />
                                        {emailExistedMsg.exsited ?
                                            <Typography
                                                sx={{
                                                    paddingTop: '5px',
                                                    fontWeight: 500,
                                                    fontSize: '0.8em',
                                                    color: '#e00',
                                                }}
                                            >{emailExistedMsg.message}</Typography>
                                            : null
                                        }
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="password"
                                            label="Password"
                                            type="password"
                                            id="password"
                                            autoComplete="new-password"
                                            InputLabelProps={textFieldShrink}
                                            value={formEditData.password}
                                            onChange={(e) => setFormEditData({ ...formEditData, password: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            name="repassword"
                                            label="Confirm Your Password"
                                            type="password"
                                            id="repassword"
                                            InputLabelProps={textFieldShrink}
                                            value={formEditData.repassword}
                                            onChange={(e) => setFormEditData({ ...formEditData, repassword: e.target.value })}
                                        />
                                        {passwordErrorMsg.error ?
                                            <Typography
                                                sx={{
                                                    paddingTop: '5px',
                                                    fontWeight: 500,
                                                    fontSize: '0.8em',
                                                    color: '#e00',
                                                }}
                                            >{passwordErrorMsg.message}</Typography>
                                            : null
                                        }

                                    </Grid>

                                    {
                                        !isEdit ? (
                                            <Grid item xs={12}>
                                                <FormControlLabel
                                                    control={<Checkbox value={showFullForm} color="primary" onChange={(e, value) => { setShowFullForm(value) }} />}
                                                    label="Continue to Business Card Creation"
                                                />
                                            </Grid>
                                        ) : null
                                    }

                                </Grid>

                                {showFullForm || isEdit ? (
                                    <Grid container spacing={2} sx={{ pt: 3 }}>
                                        <Grid item xs={12}>
                                            <Typography component='h2'
                                                fontSize={'1.3em'}
                                                sx={{
                                                    fontWeight: 800,
                                                }}
                                            >e-Business card details</Typography>
                                        </Grid>

                                        {imageUri ?
                                            <Grid item xs={12}>
                                                <div
                                                    style={{
                                                        margin: '0 auto',
                                                        width: '150px',
                                                        height: '150px',
                                                        overflow: 'hidden',
                                                        borderRadius: '20px',
                                                    }}>
                                                    <img alt='uploaded' src={imageUri} style={{
                                                        width: imageDim.w > imageDim.h? 'auto': '100%',
                                                        height: imageDim.h > imageDim.w? 'auto': '100%',
                                                        objectFit:'cover',
                                                    }} />
                                                </div>
                                            </Grid>
                                            : null
                                        }

                                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                                            <Button
                                                variant="contained"
                                                component="label"
                                                onChange={handleFileRead}
                                            >
                                                Upload your image
                                                <input
                                                    accept="image/*"
                                                    type="file"
                                                    hidden
                                                />
                                            </Button>
                                            {imageUri ?
                                                <IconButton
                                                    onClick={() => setImageUri('')}
                                                    sx={{
                                                        marginLeft: '15px',
                                                        // padding: '10px',
                                                        border: '1px #aaa solid',
                                                        borderRadius: '5px'
                                                    }}
                                                >
                                                    <DeleteIcon color='error' />
                                                </IconButton>
                                                : null}
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="title"
                                                id="title"
                                                label="Title (eg. Inline skating Trainer)"

                                                InputLabelProps={textFieldShrink}
                                                value={formEditData.title}
                                                onChange={(e) => setFormEditData({ ...formEditData, title: e.target.value })}
                                            />
                                        </Grid>

                                        <Grid item xs={6}>
                                            <FormControl fullWidth>
                                                <InputLabel id="gender-select-label">Gender</InputLabel>
                                                <Select
                                                    name='gender'
                                                    labelId="gender-select-label"
                                                    id="gender-select"
                                                    // defaultValue={GENDER[2].value}
                                                    label="Age"

                                                    value={formEditData.gender}
                                                    onChange={(e, newValue) => setFormEditData({ ...formEditData, gender: e.target.value })}
                                                >
                                                    {GENDER.map(item => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                name="introduction"
                                                id="introduction"
                                                label="Self introduction"
                                                placeholder='Describe about yourself'
                                                multiline
                                                maxRows={5}

                                                InputLabelProps={textFieldShrink}
                                                value={formEditData.introduction}
                                                onChange={(e) => setFormEditData({ ...formEditData, introduction: e.target.value })}
                                            />
                                        </Grid>

                                        <MutiStringField arr={service} setArr={setService} field={serviceField} setField={setServiceField} fieldName={'service'} fieldLabel={'Service (eg. Beginner skating)'} listLabel={'Inputed Services'} borderColor={'#56ba66aa'} />

                                        <MutiStringField arr={experience} setArr={setExperience} field={experienceField} setField={setExperienceField} fieldName={'experience'} fieldLabel={'Experience (eg. 5 years of inline skate teaching)'} listLabel={'Inputed Experience'} borderColor={'#d1c356aa'} />

                                        <MutiStringField arr={award} setArr={setAward} field={awardField} setField={setAwardField} fieldName={'Award'} fieldLabel={'Award (optional)'} listLabel={'Inputed Award'} borderColor={'#4c8bbaaa'} />

                                        <ContactField arr={contact} setArr={setContact} field={contactField} setField={setContactField} />


                                    </Grid>

                                ) : null}

                                {isEdit ? (
                                    <Box
                                        sx={{
                                            position: 'relative'
                                        }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={isUpdateLoading}
                                            sx={{ mt: 3, mb: 2 }}
                                            onClick={handleUpdate}
                                        >
                                            Update
                                        </Button>
                                        {isUpdateLoading && (
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
                                ) : (
                                    <>
                                        <Box
                                            sx={{
                                                position: 'relative'
                                            }}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                disabled={isSubmitLoading}
                                                variant="contained"
                                                sx={{ mt: 3, mb: 2 }}
                                            >
                                                Sign Up
                                            </Button>
                                            {isSubmitLoading && (
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
                                        <Grid container justifyContent="flex-end">
                                            <Grid item>
                                                <Link href="/ebusinesscard/login" variant="body2">
                                                    Already have an account? Sign in
                                                </Link>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            </Box>

                        </Box>
                        <Copyright sx={{ mt: 5 }} />
                    </Container>
                </ThemeProvider >
            }
        </>
    );
}