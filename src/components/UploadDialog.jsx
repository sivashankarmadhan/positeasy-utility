import { Button, Card, Dialog, Stack, Typography, useTheme } from '@mui/material';
import { get, isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { formatSizeUnits } from 'src/utils/formatNumber';
import ExcelPreview from './ExcelPreview';
import FullScreenDialog from './FullScreenDialog';
import FileUploadDialog from './FileUploadDialog';
import { IMPORT_EXPORT_TOOLBAR } from 'src/constants/AppConstants';

export default function UploadDialog(props) {
  const theme = useTheme();
  const {
    open,
    handleClose,
    forUpload = IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY,
    intialFetch,
  } = props;
  const [file, setFile] = useState(null);
  const defaultValueDialog = { isOpen: false, forUpload: '' };
  const [openPreview, setOpenPreview] = useState(defaultValueDialog);
  const handleFileChange = (data) => {
    setFile(data);
  };

  const handlePreview = (e) => {
    if (file) {
      setOpenPreview({ isOpen: true, forUpload: e });
      handleClose();
    }
  };
  const handleClosePreview = () => {
    setOpenPreview(defaultValueDialog);
    setFile(null);
    if (forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY) intialFetch();
  };
  const handleCloseDialog = () => {
    handleClose();
    setFile(null);
  };
  return (
    <>
      <FileUploadDialog
        open={open}
        forUpload={forUpload}
        handleClose={handleCloseDialog}
        handleFileChange={handleFileChange}
        file={file}
        handlePreview={handlePreview}
      />
      {file && (
        <FullScreenDialog
          intialFetch={intialFetch}
          forUpload={get(openPreview, 'forUpload')}
          open={get(openPreview, 'isOpen')}
          file={file}
          handleClose={handleClosePreview}
        />
      )}
    </>
  );
}
