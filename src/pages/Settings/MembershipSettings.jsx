import { Box, Button, Divider, Stack, Switch, Typography, useTheme } from '@mui/material';
import { get } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue } from 'recoil';
import { ROLES_DATA } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { currentStoreId, currentTerminalId, isMembershipState } from 'src/global/recoilState';
import AuthService from 'src/services/authService';
import SettingServices from 'src/services/API/SettingServices';
import STORES_API from 'src/services/stores';
import ViewMemberShipDialog from 'src/components/ViewMemberShipDialog';

function MembershipSettings() {
  const theme = useTheme();
  const [isMembershipEnable, setIsMembershipEnable] = useRecoilState(isMembershipState);
  const [isMerchantWiseCustomers, setIsMerchantWiseCustomers] = useState(false);
  const [currentTerminal, setSelectedTerminal] = useRecoilState(currentTerminalId);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const currentStore = useRecoilValue(currentStoreId);

  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;

  const initialFetch = async () => {
    if (!currentStore && !currentTerminal) return;
    try {
     
      const res = await STORES_API.getAccountInfo({
        storeId: currentStore,
            terminalId: currentTerminal
      });

      setIsMembershipEnable(get(res, 'data.dataValues.merchantSettings.memberShip.isActive'));
      setIsMerchantWiseCustomers(get(res, 'data.dataValues.merchantSettings.isMerchantWiseCustomers') || false)
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleMembershipEnable = async () => {
    setIsMembershipEnable(!isMembershipEnable);
    try {
      const options = {
        merchantSettings: {
          isMerchantWiseCustomers: isMerchantWiseCustomers,
          memberShip: {
            info: [],
            isActive: !isMembershipEnable,
          },
        },
      };
      const response = await SettingServices.postMemberConfiguration(options);
      initialFetch();
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    initialFetch();
  }, [currentStore, currentTerminal]);

  return (
    <Box
      sx={{
        pointerEvents: isAuthorizedRoles ? 'default' : 'none',
      }}
    >
      <Stack flexDirection={'column'} sx={{ gap: 2, mb: 2 }}>
        <Stack
          className="settingConfigStep8"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mr={1}
          ml={1}
        >
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '15px' }}>
              Membership
            </Typography>

            <Typography pb={1} variant="body2">
              Add Membership in billing
            </Typography>
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
              {isMembershipEnable && (
                <Stack flexDirection="row" gap={1} alignItems="center">
                  <Button variant="contained" 
                  onClick={()=> setMemberDialogOpen(true)}
                  >
                    View Members
                  </Button>
                </Stack>
              )}
            </Typography>
          </Box>
          <Stack
            flexDirection={'column'}
            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}
          >
            <Switch
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
              }}
              checked={isMembershipEnable}
              onChange={handleMembershipEnable}
            />
          </Stack>
        </Stack>
        <Divider />
      </Stack>
      {memberDialogOpen && (
        <ViewMemberShipDialog
          open={memberDialogOpen}
          handleClose={()=> setMemberDialogOpen(false)}
          initialFetch={initialFetch}
        />
      )}
    </Box>
  );
}

export default MembershipSettings;
