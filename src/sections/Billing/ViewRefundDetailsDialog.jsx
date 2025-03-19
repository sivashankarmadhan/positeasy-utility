import { Card, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { get } from 'lodash';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import CloseIcon from '@mui/icons-material/Close';
import PRODUCTS_API from 'src/services/products';
import RowContent from './RowContent';
import { dateFormat, formatTime } from 'src/utils/formatTime';
import { fCurrency } from 'src/utils/formatNumber';
import ReplayIcon from '@mui/icons-material/Replay';
import { ThreeDots } from 'react-loader-spinner';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import { SuccessConstants } from 'src/constants/SuccessConstants';

const ViewRefundDetailsDialog = ({ isOpen, onClose, paymentId }) => {
  const [refundDetails, setRefundDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const triggerVerifyRefund = async () => {
    try {
      setIsLoading(true);
      const res = await PRODUCTS_API.verifyRefund({
        paymentId,
      });
      setRefundDetails(get(res, 'data'));
    } catch (e) {
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      triggerVerifyRefund();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <Card sx={{ p: 2, width: { xs: 340, sm: 400 } }}>
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2, ml: 2 }}
        >
          <Typography variant="h6">Refund Details</Typography>

          <Stack flexDirection="row" alignItems="center" gap={0.5} sx={{ mr: 2 }}>
            <IconButton onClick={triggerVerifyRefund}>
              <ReplayIcon />
            </IconButton>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack
          flexDirection="column"
          spacing={3}
          sx={{ height: 300, overflow: 'auto', width: '100%' }}
        >
          {isLoading ? (
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              sx={{ height: '100%', width: '100%' }}
            >
              <ThreeDots
                height="40"
                width="100"
                radius="9"
                color="#5a0a45"
                ariaLabel="three-dots-loading"
                wrapperStyle={{ marginBottom: 20 }}
                wrapperClassName=""
                visible={true}
              />
            </Stack>
          ) : (
            <>
              <RowContent
                title="Payment ID"
                value={get(refundDetails, 'paymentId', '')}
                icon={
                  <Stack
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      navigator.clipboard.writeText(get(refundDetails, 'paymentId', ''));
                      toast.success(SuccessConstants.COPY_CLIPBOARD);
                    }}
                  >
                    <Tooltip title="Copy">
                      <CopyAllIcon sx={{ fontSize: '20px' }} />
                    </Tooltip>
                  </Stack>
                }
              />
              <RowContent title="Refund txn ID" value={get(refundDetails, 'refundTxnId', '')} />
              <RowContent
                title="Refund amount"
                value={fCurrency(get(refundDetails, 'refundAmount', '') / 100)}
              />
              <RowContent title="Type" value={get(refundDetails, 'type', '')} />
              <RowContent title="Status" value={get(refundDetails, 'payResponseCode', '')} isChip />

              <RowContent
                title="Refund initiated date"
                value={dateFormat(get(refundDetails, 'createdAt', ''))}
              />
              <RowContent
                title="Refund initiated time"
                value={formatTime(get(refundDetails, 'createdAt', ''))}
              />
            </>
          )}
        </Stack>
      </Card>
    </Dialog>
  );
};

export default ViewRefundDetailsDialog;
