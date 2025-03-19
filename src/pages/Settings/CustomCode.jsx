import AddIcon from '@mui/icons-material/Add';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
  useTheme,
  Switch,
  Divider,
  Box,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import CustomCodeView from 'src/components/CustomCodeView';
import TakeATourWithJoy from 'src/components/TakeATourWithJoy';
import { ROLES_DATA, SettingsSections } from 'src/constants/AppConstants';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import RouterConstants from 'src/constants/RouterConstants';
import { SettingTourCustom } from 'src/constants/TourConstants';
import { SelectedSection } from 'src/global/SettingsState';
import { allConfiguration, currentStoreId, currentTerminalId } from 'src/global/recoilState';
import AddCustomCode from 'src/sections/Settings/CustomCode/AddCustomCode';
import SettingServices from 'src/services/API/SettingServices';
import AuthService from 'src/services/authService';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const CustomCode = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const setSection = useSetRecoilState(SelectedSection);
  const location = useLocation();
  const [customCodes, setCustomCodes] = useState([]);
  const [customCodeMode, setCustomCodeMode] = useState(false);
  const [editCustomCode, setEditCustomCode] = useState({});
  const currentStore = useRecoilValue(currentStoreId);
  const currentTerminal = useRecoilValue(currentTerminalId);
  const [isOpenAddCustomCodeModal, setIsOpenAddCustomCodeModal] = useState(false);
  const currentRole = AuthService.getCurrentRoleInLocal();
  const isAuthorizedRoles =
    ROLES_DATA.master.role === currentRole ||
    ROLES_DATA.manager_and_staff.role === currentRole ||
    ROLES_DATA.store_manager.role === currentRole;
  const closeCustomCodeModal = () => {
    setEditCustomCode({});
    setIsOpenAddCustomCodeModal(false);
    if (!customCodes?.length) {
      setCustomCodeMode(false);
    }
  };

  const customCode = get(configuration, 'customCode', true);

  const initialFetch = async (isEnableSwitchMode) => {
    if (!currentStore && !currentTerminal) return;
    try {
      const resp = await SettingServices.getConfiguration();
      const customCodesDetails = await SettingServices.getCustomCodesData();
      resp && setCustomCodes(get(customCodesDetails, 'data', []));

      if (resp) {
        if (isEnableSwitchMode) {
          setCustomCodeMode(true);
        } else {
          setConfiguration({
            ...(configuration || {}),
            ...(get(resp, 'data.0') || {}),
          });
          setCustomCodeMode(get(resp, 'data.0.customCode', false));
        }
      }
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    initialFetch(location?.state?.isEnableSwitchMode);
  }, [currentStore]);

  useEffect(() => {
    if (location?.state?.isEnableSwitchMode) {
      setIsOpenAddCustomCodeModal(true);
      setSection(SettingsSections[2].path);
    }
  }, [location]);

  const handlePostCustomCodeMode = async () => {
    try {
      const options = {
        customCode: !customCode,
      };
      await SettingServices.postConfiguration(options);

      await initialFetch();
      toast.success(SuccessConstants.SAVE_SUCCESSFUL);
    } catch (err) {
      toast.error(err?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  const handleChangeCustomCodeMode = (e) => {
    handlePostCustomCodeMode();
  };

  return (
    <>
      <Card
        sx={{
          mb: 3,
          pl: 3,
          mx: 1,
          my: {
            xs: 2,
            md: 2,
          },
          pt: 1,
          // minHeight: 'calc(100vh - 270px)',
          xs: { width: 370 },
        }}
      >
        <Stack
          className="settingConfigStep2"
          mb={2}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6"> Custom code</Typography>
            <Typography variant="body2">
            If enabled, custom code can be added (eg: employee identity, floor, etc.,) in your billing report.
            </Typography>
          </Box>
          <Switch
            checked={customCodeMode}
            onChange={handleChangeCustomCodeMode}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: theme.palette.primary.light,
              },
              '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                backgroundColor: theme.palette.primary.light,
              },
              mx: 1.35,
            }}
          />
        </Stack>
      </Card>

      {customCode && (
        <Card
          sx={{
            mb: 3,
            mx: 1,
            my: {
              xs: 2,
              md: 2,
            },
            mt: 0,
            // minHeight: 'calc(100vh - 270px)',
            xs: { width: 370 },
          }}
        >
          <CardHeader
            title="Custom Code Information"
            action={
              <Button
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setIsOpenAddCustomCodeModal(true)}
              >
                Add custom code
              </Button>
            }
          />
          <CardContent>
            {!isEmpty(customCodes) && (
              <Stack spacing={3}>
                {map(customCodes, (_item) => (
                  <CustomCodeView
                    _item={{ ..._item }}
                    setIsOpenAddCustomCodeModal={setIsOpenAddCustomCodeModal}
                    setEditCustomCode={setEditCustomCode}
                    initialFetch={initialFetch}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <AddCustomCode
        isOpenAddCustomCodeModal={isOpenAddCustomCodeModal}
        closeCustomCodeModal={closeCustomCodeModal}
        editCustomCode={editCustomCode}
        customCodes={customCodes}
        initialFetch={initialFetch}
      />
      <TakeATourWithJoy config={SettingTourCustom} />
    </>
  );
};

export default CustomCode;
