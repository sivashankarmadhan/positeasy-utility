import { Button, Card, Dialog, Stack, Typography, useTheme } from '@mui/material';
import { forEach, get, isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IMPORT_EXPORT_TOOLBAR, IMPORT_EXPORT_TOOLBAR_TITLE } from 'src/constants/AppConstants';
import { formatSizeUnits } from 'src/utils/formatNumber';
import { CSV_Import } from 'src/constants/CSVInventoryConstant';
import { CSVLink, CSVDownload } from 'react-csv';
import PRODUCTS_API from 'src/services/products';
import ONLINE_STORES from 'src/services/onlineStoresServices';
import { ErrorConstants } from 'src/constants/ErrorConstants';

export default function FileUploadDialog(props) {
  const {
    open,
    handleClose,
    handleFileChange,
    file,
    handlePreview,
    forUpload = IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY,
  } = props;
  const theme = useTheme();

  const [dragOver, setDragOver] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);

  const [onlineStockForCurrentStock, setOnlineStockForCurrentStock] = useState({});

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = get(e, 'dataTransfer.files');
    if (get(droppedFile, 'length') === 1) {
      const isSupported = get(droppedFile, '0.type')?.includes('csv');
      if (isSupported) {
        setDraggedFile(droppedFile);
        handleFileChange(droppedFile[0]);
      } else {
        toast.error('Upload  file not supported');
      }
    } else {
      toast.error('Upload one file at a time');
    }
  };

  const getOnlineStockForCurrentStock = async () => {
    try {
      const res = await ONLINE_STORES.getOnlineStockForCurrentStock();
      const formatRes = [['Product ID', 'Name', 'Current stock']];
      forEach(get(res, 'data'), (_item) => {
        formatRes.push([
          get(_item, 'productId'),
          get(_item, 'FDSettings.title'),
          get(_item, 'FDSettings.current_stock'),
        ]);
      });
      setOnlineStockForCurrentStock(formatRes);
    } catch (error) {
      toast.error(error?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };

  useEffect(() => {
    if (open) {
      getOnlineStockForCurrentStock();
    }
  }, [open]);

  return (
    <Dialog open={open} sx={{ width: '100%' }}>
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'row',
          border: dragOver ? '2px dashed red' : 'none',
          width: { xs: 360, md: 400 },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Stack flexDirection={'column'} gap={1} sx={{ width: '100%' }}>
          <Stack
            flexDirection={'row'}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1">
              Upload &nbsp;
              {forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY
                ? IMPORT_EXPORT_TOOLBAR_TITLE.INVENTORY
                : forUpload === IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY
                ? IMPORT_EXPORT_TOOLBAR_TITLE.PARTNER_INVENTORY
                : forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_ONLINE_STOCK
                ? IMPORT_EXPORT_TOOLBAR_TITLE.ONLINE_STOCK
                : ''}
            </Typography>
            {forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY && (
              <CSVLink filename={'inventory_format'} data={CSV_Import}>
                Download format
              </CSVLink>
            )}
            {forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_ONLINE_STOCK &&
              !isEmpty(onlineStockForCurrentStock) && (
                <CSVLink filename={'online_stock_format'} data={onlineStockForCurrentStock}>
                  Download format
                </CSVLink>
              )}
          </Stack>
          <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%' }}>
            <Card
              sx={{
                p: 5,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px dashed',
                '&:hover': {
                  border: '1px solid',
                },
                borderColor: dragOver ? theme.palette.success.main : theme.palette.primary.main,
              }}
            >
              {!file && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    mx: 'auto',
                    display: 'block',
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  {forUpload === 'report'
                    ? ` .xlsx, and .xls format files are allowed`
                    : `.csv format files are only allowed`}
                </Typography>
              )}
              <input
                id="file-input"
                type="file"
                accept={forUpload === 'report' ? '.xls,.xlsx' : '.csv'}
                onChange={(e) => handleFileChange(e.target.files[0])}
                style={{ display: 'none' }}
              />

              {file && (
                <Typography
                  variant="subtitle1"
                  sx={{ display: 'inline', textAlign: 'center', color: 'text.secondary' }}
                >
                  {get(file, 'name')} {formatSizeUnits(file.size)}
                </Typography>
              )}
            </Card>
          </label>
          <Stack flexDirection={'row'} justifyContent={'flex-end'} gap={1}>
            <Button color="error" variant="contained" onClick={handleClose}>
              Close
            </Button>
            <Button disabled={!file} variant="contained" onClick={() => handlePreview(forUpload)}>
              Preview & Upload
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Dialog>
  );
}
