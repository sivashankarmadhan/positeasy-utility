import { Box, Divider, Stack, Switch, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import FilterPopOver from 'src/layouts/dashboard/header/FilterPopOver';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddGst from './AddGst';
import toast from 'react-hot-toast';
import SettingServices from 'src/services/API/SettingServices';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { get } from 'lodash';

const Gst = ({ gstData, initialFetch }) => {
  // theme
  const theme = useTheme();

  // state
  // const [isGstPercentageEnable, setIsGstPercentageEnable] = useState(false);
  const [isOpenAddGstModal, setIsOpenAddGstModal] = useState(false);

  /**
   * toggle switch
   * if disabled, trigger call for remove gst API
   */
  const handleSwitchGstMode = async () => {
    if (get(gstData, 'gstEnabled')) {
      try {
        const options = {
          gstEnabled: false,
        };
        await SettingServices.updateGst(options);
        await initialFetch();
      } catch (error) {
        toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_REMOVE_GST);
      }
    } else {
      setIsOpenAddGstModal(true);
    }
  };

  /**
   * handle close GST Modal
   */
  const closeGstModal = () => {
    setIsOpenAddGstModal(false);
  };

  /**
   * send Gst percentage to backend
   */
  const onSubmit = async (data, reset) => {
    try {
      const options = {
        ...data,
        gstEnabled: true,
      };
      await SettingServices.updateGst(options);
      await initialFetch();
      setIsOpenAddGstModal(false);
      reset();
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.FAILED_TO_UPDATE_GST);
    }
  };

  return (
    <>
      <Box>
        <Stack mb={2} flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Stack flexDirection="row" gap={1}>
              <Typography variant="h6">GST </Typography>

              {get(gstData, 'gstEnabled') &&
                get(gstData, 'gstNumber') &&
                get(gstData, 'gstPercent') && (
                  <FilterPopOver
                    sx={{ display: 'flex', overflow: 'auto' }}
                    customWidth="20vw"
                    IconChildren={<InfoOutlinedIcon />}
                  >
                    <Stack flexDirection="column" p={2}>
                      <Typography variant="body2">
                        <span>GST Number is</span>
                        <span style={{ color: theme.palette.primary.light, marginLeft: 3 }}>
                          {get(gstData, 'gstNumber')}
                        </span>
                      </Typography>
                      <Typography variant="body2">
                        <span>GST</span>
                        <span
                          style={{
                            color: theme.palette.primary.light,
                            marginLeft: 3,
                            marginRight: 3,
                          }}
                        >
                          {`${get(gstData, 'gstPercent')}%`}
                        </span>
                        <span>will add every billing</span>
                      </Typography>
                    </Stack>
                  </FilterPopOver>
                )}
            </Stack>

            <Typography variant="body2">
              If Enable, You can add GST number and GST percentage
            </Typography>
          </Box>
          <Stack alignItems="flex-end">
            <Switch
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: theme.palette.primary.light,
                },
                '& .MuiSwitch-switchBase.Mui-checked+.MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.light,
                },
                mx: 1.35,
              }}
              checked={!!get(gstData, 'gstEnabled')}
              onChange={handleSwitchGstMode}
            />
          </Stack>
        </Stack>
        <Divider />
      </Box>
      {isOpenAddGstModal && (
        <AddGst
          onSubmit={onSubmit}
          isOpenAddGstModal={isOpenAddGstModal}
          closeGstModal={closeGstModal}
        />
      )}
    </>
  );
};

export default Gst;
