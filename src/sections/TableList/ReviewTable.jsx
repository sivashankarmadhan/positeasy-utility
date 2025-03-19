import {
    Box,
    Button,
    Drawer,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { isEmpty, map } from 'lodash';
import React, { useState } from 'react';
import FormProvider from 'src/components/FormProvider';
import { RHFAutocompleteObjOptions, RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFDatePicker from 'src/components/hook-form/RHFDatePicker';
import {
    BookingType,
    EventType,
    hideScrollbar,
    PaymentModeTypeConstants,
    PaymentPerson,
    PaymentTypeConstants,
    REQUIRED_CONSTANTS,
    StatusType,
    VALIDATE_CONSTANTS,
} from 'src/constants/AppConstants';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CloseIcon from '@mui/icons-material/Close';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { Dialog } from '@mui/material';
import Card from '@mui/material/Card';
import { Select } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TABLESERVICES_API from 'src/services/API/TableServices';
import toast from 'react-hot-toast';
const ReviewTable = ({
    handleAddExpense,
    reserved, setReserved
}) => {
    const theme = useTheme();

    const [expenseDate, setExpenseDate] = useState(dayjs());

    const isMobile = useMediaQuery('(max-width:600px)');

    const isMinWidth600px = useMediaQuery('(min-width:600px)');
    const isMaxWidth900px = useMediaQuery('(max-width:900px)');
    const isTab = isMinWidth600px && isMaxWidth900px;

    const RegisterSchema = Yup.object().shape({
        Tablename: Yup.string(),
        Mr: Yup.string(),
        paymentType: Yup.string(),
        depositfee: Yup.string(),
        StatusType: Yup.string(),
        MobileNumber: Yup.string(),
        EmailAddress: Yup.string(),
        FullName: Yup.string().max(200, VALIDATE_CONSTANTS.INFO_MAX_30_CHAR),
        paxnumber: Yup.string(),
        BookingType: Yup.string(),
        EventType: Yup.string(),
        Mr: Yup.string(),
        Description: Yup.string(),
    });


    const defaultValues = {
        Tablename: '',
        paxnumber: '',
        amountSpent: '',
        depositfee: '',
        StatusType: '',
        FullName: '',
        dateAndTime: '',
        Mr: '',
        MobileNumber: '',
        EmailAddress: '',
        BookingType: '',
        EventType: '',
        paymentType: '',
        Description: '',
    };
    const methods = useForm({
        resolver: yupResolver(RegisterSchema),
        defaultValues,
    });

    const { reset, setError, handleSubmit, formState: { errors, isSubmitting } } = methods;


    console.log('errors', errors);


    const onSubmit = async (data) => {


        const obj = {
            hhhh: data.p,

        }

        try {
            const options = { ...data, expenseDate };

            const res = await TABLESERVICES_API.postTable(options);


        } catch (error) {
            console.log("sss", error);
            toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
        }

    };

    return (
        <Stack sx={{ bgcolor: "#F6F7F8" }}>

            <Dialog open={reserved} 
            >
                <Stack>

                    <Stack xs display="flex" justifyContent="space-between " mx={4} mt={3} mr={3} mb={2} >
                        <h5  >Add New Reservation</h5>
                        <IconButton onClick={() => {
                            setReserved(false)
                        }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                    <Card sx={{ p: 1, width: { xs: 360, sm: 600 } }}>

                        <Stack sx={{ pl: 3 }}>Reservation Details</Stack>
                        <Stack sx={{ margin: 2 }}>

                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%" }} mb={2}  >



                                <RHFTextField sx={{ bgcolor: "#F6F7F8", mt: 2, mx: 3 }} label="Select Table Name" id="Select Table Name" name="Tablename" />



                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                                        <DateTimePicker sx={{ bgcolor: "#F6F7F8", mt: 1 }}
                                            format="YY-MM-DD hh:mm A"
                                            label="Reservation date and time"
                                            value={expenseDate}
                                            onChange={(newValue) => setExpenseDate(newValue)}
                                            name="date And Time"
                                        />
                                    </DemoContainer>
                                </LocalizationProvider>
                            </Stack>

                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%" }} mb={2.5}>


                                <RHFTextField sx={{ bgcolor: "#F6F7F8", mx: 2, }}
                                    label="Pax Number" id=" Pax Number " name="paxnumber" />



                                <RHFTextField sx={{ bgcolor: "#F6F7F8", }}
                                    label="Deposit Fee" id=" Deposit Fee " name="depositfee" />
                            </Stack>



                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%" }} mb={2.5} mt={2} >


                                <Select sx={{ bgcolor: "#F6F7F8" }} BookingType="BookingType" id='BookingType' label="Booking Type" name='BookingType' >
                                    {map(BookingType, (e) => (
                                        <MenuItem value={e}>{e}</MenuItem>
                                    ))}
                                </Select>


                                <Select sx={{ bgcolor: "#F6F7F8" }} Status="EventType" id='EventType' label="EventType" name="EventType" >
                                    {map(EventType, (e) => (
                                        <MenuItem value={e}>{e}</MenuItem>
                                    ))}
                                </Select>

                            </Stack>

                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%" }} mb={2.5} mt={2}     >
                                <Select sx={{ bgcolor: "#F6F7F8", mx: 2, }} Status="Status" id='Status' label="Status" name="Status Type"  >
                                    {map(StatusType, (e) => (
                                        <MenuItem value={e}>{e}</MenuItem>
                                    ))}
                                </Select>

                                <RHFTextField sx={{ bgcolor: "#F6F7F8" }}
                                    label="Description" id="Description " name=" Description " />


                            </Stack>



                            <Box sx={{ pl: 2, mt: 2 }}>Client Details</Box>

                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%", }} mb={2.5} mt={2}>


                                <Select sx={{ bgcolor: "#F6F7F8", mx: 2,  width:'50%'}} Mr="Mr" variant="outlined" label="Mr" name="Mr" >
                                    {map(PaymentPerson, (e) => (
                                        <MenuItem value={e}>{e}</MenuItem>
                                    ))}
                                </Select>



                                <RHFTextField sx={{ bgcolor: "#F6F7F8" }}
                                    label="Full Name" id=" Full Name " name="FullName" />
                            </Stack>


                            <Stack xs display="flex" flexDirection="row" justifyContent="space-between " sx={{ width: "100%" }} mb={2.5}>

                                <RHFTextField sx={{ bgcolor: "#F6F7F8", mx: 2, }}
                                    label="Mobile Number" id=" Mobile Number " name="MobileNumber" />




                            
                            </Stack>


                            <Stack >

                                < Stack sx={{ pl: 2, mb: 2 }}>Additional Details </Stack>
                                <Stack xs display="flex" justifyContent="start" alignItems="center" mb={2} pl={2} gap={1}>
                                    <AccountCircleIcon />
                                    <Box sx={{ fontWeight: 'bold' }}> Customer ID </Box>
                                </Stack>
                                <Select sx={{ bgcolor: "#F6F7F8", width: "100%" }} paymentType="paymentType" id='paymentType' label="Payment Type" name="paymentType" >
                                    {map(PaymentModeTypeConstants, (e) => (
                                        <MenuItem value={e}>{e}</MenuItem>
                                    ))}
                                </Select>


                            </Stack>

                        </Stack>


                        <Stack flexDirection='row' alignItems="center" justifyContent="flex-end" mt={2}  >

                            <Button onClick={() => {

                                setReserved(false)

                            }} variant="outlined" size="large" sx={{ mr: 1, backgroundColor: '#FFD9D9', color: '#212B36', mb: 2, mt: 1 }}
                            >

                                Clear
                            </Button>

                            <Button onClick={() => {

                            }} size="large" type="submit" variant="contained" sx={{ mb: 2, mr: 2, mt: 1 }} >
                                Submit
                            </Button>
                        </Stack>
                    </Card>
                </FormProvider>
            </Dialog>
        </Stack>
    );
};

export default ReviewTable;
