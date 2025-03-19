//import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Stack from '@mui/material/Stack';
import React, { forwardRef, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';
import DatePicker, { CalendarContainer } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DateRangeIcon from '@mui/icons-material/DateRange';
import { alpha } from "@mui/system"
import { useTheme } from "@mui/material";

function StartAndEndDatePicker({ startDate, setStartDate, endDate, setEndDate }) {
    //const [startDate, setStartDate] = useState(new Date());
  //const [endDate, setEndDate] = useState(null);
  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const theme=useTheme();
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
     style={{backgroundColor: alpha("#000000",0),border:"0"}} onClick={onClick} ref={ref}>
      <DateRangeIcon fontSize='large'/>
      {value}
    </button>
  ));
  
  return (
      <DatePicker
      selected={startDate}
      onChange={onChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange 
      fixedHeight
      dateFormat="dd/MMMM/yyyy"
      isClearable={true}
      customInput={<ExampleCustomInput />}
      withPortal
    >
      
      <div sx={{wordWrap:'break-word'}}>double-click on a date to get report for that particular date</div>
      </DatePicker>
  );
}
export default StartAndEndDatePicker;
