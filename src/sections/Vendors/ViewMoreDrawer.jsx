import React from 'react';
import {
  Drawer,
  Stack,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  styled,
  Typography,
  TableCell,
  tableCellClasses,
  Paper,
  Dialog,
  IconButton,
  Card,
} from '@mui/material';
import { useMediaQuery } from '@poriyaalar/custom-hooks';
import { hideScrollbar } from 'src/constants/AppConstants';
import CloseIcon from '@mui/icons-material/Close';
import { get } from 'lodash';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const ViewMoreDrawer = ({ openViewMoreDrawer, setOpenViewMoreDrawer, _item }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isMinWidth600px = useMediaQuery('(min-width:600px)');
  const isMaxWidth900px = useMediaQuery('(max-width:900px)');
  const isTab = isMinWidth600px && isMaxWidth900px;

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
  }));

  console.log('_item', _item);

  return (
    <Dialog
      open={openViewMoreDrawer}
      
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 200,
          overflow: 'auto',
          minWidth: 350,
          maxWidth: 600,
        }}
      >
        <Stack
          flexShrink={1}
          flexDirection="row"
          px={2}
          py={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E0E1E1',
          }}
        >
          <Typography variant="h6">Additional Info</Typography>
          <IconButton
            onClick={() => {
              setOpenViewMoreDrawer(false);
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </Stack>

        <Stack
          flexGrow={1}
          gap={3}
          px={2}
          pb={2}
          pt={1}
          container
          justifyContent={'center'}
          textAlign={'center'}
          overflow="auto"
        >
          <TableContainer
            sx={{
              borderTopRightRadius: 0,
              borderTopLeftRadius: 0,
            }}
            component={Paper}
          >
            <Table
              stickyHeader
              sx={{
                '& .MuiTableCell-sizeSmall': {
                  padding: '6px 0px 6px 16px', // <-- arbitrary value
                },
              }}
            >
              {/* <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  GST Details
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow> */}

              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  FSSAI Lic No
                </TableCell>
                <TableCell align="right">{get(_item, 'vendorInfo.fssaiLicNo') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  GST No
                </TableCell>
                <TableCell align="right">{get(_item, 'vendorInfo.gstNo') || '-'}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Billing Address
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Country / Region
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.countryOrRegion') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Address
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.address') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  City
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.city') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  State
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.state') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Zip Code
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.zipCode') || '-'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Shipping Address
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>

              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Country / Region
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.countryOrRegion') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Address
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.address') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  City
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.city') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  State
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.state') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Zip Code
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.zipCode') || '-'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Bank Details
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>

              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Beneficiary Name
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'bankingInfo.beneficiaryName') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Bank Name
                </TableCell>
                <TableCell align="right">{get(_item, 'bankingInfo.bankName') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Account Number
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'bankingInfo.accountNumber') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  IFSC
                </TableCell>
                <TableCell align="right">{get(_item, 'bankingInfo.ifsc') || '-'}</TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Stack>
      </Card>
    </Dialog>
  );

  return (
    <Stack>
      <Drawer
        PaperProps={{
          sx: { width: isMobile ? '100%' : isTab ? '70%' : '30%', ...hideScrollbar },
        }}
        anchor="right"
        open={openViewMoreDrawer}
        onClose={() => setOpenViewMoreDrawer(false)}
        onOpen={() => setOpenViewMoreDrawer(true)}
      >
        <Stack gap={3} container justifyContent={'center'} textAlign={'center'}>
          <TableContainer
            sx={{
              borderTopRightRadius: 0,
              borderTopLeftRadius: 0,
              '& .MuiTableCell-sizeSmall': {
                padding: '6px 0px 6px 16px', // <-- arbitrary value
              },
            }}
            component={Paper}
            p={2}
          >
            <Table
              stickyHeader
              sx={{
                '& .MuiTableCell-sizeSmall': {
                  padding: '6px 0px 6px 16px', // <-- arbitrary value
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell style={{ backgroundImage: 'none' }} colSpan={6} align="center">
                    <Stack flexDirection={'row'} pr={0} justifyContent={'space-between'}>
                      <Typography fontWeight={600}>View More</Typography>
                      <CloseIcon
                        onClick={() => {
                          setOpenViewMoreDrawer(false);
                        }}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Stack>
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Billing Address
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Country / Region
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.countryOrRegion') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Address
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.address') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  City
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.city') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  State
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.state') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Zip Code
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.billingAddress.zipCode') || '-'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Shipping Address
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>

              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Country / Region
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.countryOrRegion') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Address
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.address') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  City
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.city') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  State
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.state') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Zip Code
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'vendorInfo.shippingAddress.zipCode') || '-'}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '15px',
                    borderBottom: '1px solid #E0E1E1',
                    color: theme.palette.primary.main,
                  }}
                >
                  Bank Details
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #E0E1E1' }} />
              </TableRow>

              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Beneficiary Name
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'bankingInfo.beneficiaryName') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Bank Name
                </TableCell>
                <TableCell align="right">{get(_item, 'bankingInfo.bankName') || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  Account Number
                </TableCell>
                <TableCell align="right">
                  {get(_item, 'bankingInfo.accountNumber') || '-'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>
                  IFSC
                </TableCell>
                <TableCell align="right">{get(_item, 'bankingInfo.ifsc') || '-'}</TableCell>
              </TableRow>
            </Table>
          </TableContainer>
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default ViewMoreDrawer;
