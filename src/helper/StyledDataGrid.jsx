import { alpha, styled } from '@mui/material/styles';
import { DataGrid, gridClasses } from '@mui/x-data-grid';

const ODD_OPACITY = 0.2;
const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeaderTitle': {
    textOverflow: 'clip',
  },
  [`& .${gridClasses.columnHeader} .${gridClasses.menuIcon}`]: {
    visibility: 'visible',
    width: 'auto',
  },
  [`& .${gridClasses.columnSeparator}`]: {
    visibility: 'visible',
    width: 'auto',
  },
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.grey[200],
    '&:hover, &.Mui-hovered': {
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(
        theme.palette.primary.main,
        ODD_OPACITY + theme.palette.action.selectedOpacity
      ),
      '&:hover, &.Mui-hovered': {
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            ODD_OPACITY + theme.palette.action.selectedOpacity
          ),
        },
      },
    },
  },
}));

export default StyledDataGrid;
