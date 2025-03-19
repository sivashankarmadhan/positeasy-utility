import { Icon } from '@iconify/react';
import {
  ControlPointSharp as ControlPointSharpIcon,
  EditSharp as EditSharpIcon,
} from '@mui/icons-material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, CardContent, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { currentStoreId, currentTerminalId } from 'src/global/recoilState';
import StoreServices from 'src/services/API/StoreServices'; // Adjust path as per your project structure
import AuthService from 'src/services/authService'; // Adjust path as per your project structure
import MerchantIdDialog from './MerchantIdDialog';

export default function PaymentGateway() {
  const theme = useTheme();
  const currentRole = AuthService.getCurrentRoleInLocal();

  const [storesData, setStoresData] = useState({
    dataValues: {
      phonepeMerchantId: '',
    },
  });

  const [openEditMerchantIdDialog, setOpenEditMerchantIdDialog] = useState(false);
  const [editedMerchantId, setEditedMerchantId] = useState('');
  const [newMerchantId, setNewMerchantId] = useState('');
  const [paymentErrorDialogOpen, setPaymentErrorDialogOpen] = useState(false);

  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);

  const PRIMARY_LIGHT = theme.palette.primary.light;
  const PRIMARY_DARK = theme.palette.primary.dark;

  // Fetch merchant ID from API when component mounts
  useEffect(() => {
    fetchMerchantId(); // Fetch initial merchant ID
  }, []);

  // Function to fetch merchant ID from API
  const fetchMerchantId = async () => {
    try {
      const response = await StoreServices.getMerchantIdFromPhonePeAccount(); // Assuming this function is implemented in StoreServices
      const authtag = response?.data?.authTag; // Extract authtag from response data

      // Store the response data in one variable
      const merchantIdData = {
        authtag: authtag,
        // Add more properties if needed
      };
      setNewMerchantId(merchantIdData); // Set initial merchant ID
    } catch (error) {
      console.error('Error fetching merchant ID:', error);
      setNewMerchantId(''); // Clear merchant ID on error
      setPaymentErrorDialogOpen(true); // Show error dialog
    }
  };

  const handleOpenEditMerchantIdDialog = () => {
    setOpenEditMerchantIdDialog(true);
    setEditedMerchantId(storesData.dataValues.phonepeMerchantId); // Set initial edited merchant ID
  };

  const handleCloseEditMerchantIdDialog = () => {
    setOpenEditMerchantIdDialog(false);
  };

  const handleSaveMerchantId = () => {
    // Save editedMerchantId to backend or perform necessary actions
    // Example: Update storesData with new merchant ID
    setStoresData((prev) => ({
      ...prev,
      dataValues: {
        ...prev.dataValues,
        phonepeMerchantId: editedMerchantId,
      },
    }));
    handleCloseEditMerchantIdDialog();
  };

  const handleMerchantIdChange = (event) => {
    setEditedMerchantId(event.target.value);
  };

  const showAddMerchantButton = !newMerchantId.authtag;

  return (
    <Box sx={{ border: '1px solid #DEDEDE', borderRadius: '12px' }}>
      <CardContent>
        {/* Original Phonepe icon and text */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Icon
              icon="simple-icons:phonepe"
              color="#6a1b9a"
              width="40"
              height="30"
              sx={{ marginLeft: 8 }}
            />
            <Typography variant="h5" sx={{ marginLeft: 1, color: '#6a1b9a' }}>
              Phonepe
            </Typography>
          </Box>

          {/* Input field with ControlPointIcon and Phonepe Merchant ID text */}

          <Stack flexDirection={'row'}>
            {' '}
            <Stack mr={1}>
              {' '}
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  background: '#F4F5F7',
                  p: 1.5,
                  borderRadius: '7px',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  height: '50px !important',
                }}
                onClick={handleOpenEditMerchantIdDialog}
              >
                {' '}
                {showAddMerchantButton ? (
                  <ControlPointSharpIcon sx={{ marginRight: '0.2rem' }} />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: '0.2rem',
                    }}
                  >
                    <CheckCircleOutlineIcon
                      sx={{ fontSize: '20px', color: 'green', marginRight: '0.2rem' }}
                    />
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '20px',
                        color: 'black',
                        marginRight: '0.2rem',
                        marginTop: '10px',
                      }}
                    >
                      ******
                    </Typography>
                  </Box>
                )}
                <Typography variant="body1">
                  {showAddMerchantButton ? 'Add Merchant' : ''}
                </Typography>
              </Box>
              {!showAddMerchantButton && (
                <Typography
                  variant="body6"
                  sx={{
                    fontSize: '10px',
                    color: 'green',
                    marginLeft: '30px',
                    // position: 'absolute',
                    right: '100px', // Adjust as needed
                    // Adjust as needed
                  }}
                >
                  verified
                </Typography>
              )}
            </Stack>
            {!showAddMerchantButton && (
              <Box sx={{ marginTop: '-13px', marginleft: 'auto!important' }}>
                <EditSharpIcon
                  sx={{ fontSize: '20px', cursor: 'pointer', marginTop: '25px' }}
                  onClick={handleOpenEditMerchantIdDialog}
                />
              </Box>
            )}
          </Stack>
        </Box>

        {/* Merchant ID Edit Dialog */}
        <MerchantIdDialog
          isOpen={openEditMerchantIdDialog}
          onClose={handleCloseEditMerchantIdDialog}
          onSave={handleSaveMerchantId}
          onChange={handleMerchantIdChange}
          currentMerchantId={editedMerchantId}
          showAddMerchantButton={showAddMerchantButton}
        />
      </CardContent>
    </Box>
  );
}
