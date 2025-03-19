import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Button } from '@mui/material';
//
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadMultiFile.propTypes = {
  files: PropTypes.array,
  error: PropTypes.bool,
  showPreview: PropTypes.bool,
  onUpload: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  helperText: PropTypes.node,
  sx: PropTypes.object,
};

export default function UploadMultiFile({
  error,
  showPreview = false,
  files,
  onUpload,
  onRemove,
  onRemoveAll,
  helperText,
  sx,
  type,
  isEdit,
  ...other
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other,
  });

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <DropZoneStyle
        {...getRootProps()}
        sx={{
          ...(isDragActive && { opacity: 0.72 }),
          ...((isDragReject || error) && {
            color: 'error.main',
            borderColor: 'error.light',
            bgcolor: 'error.lighter',
          }),
        }}
      >
        <input {...getInputProps()} />

        <BlockContent type={type} />
      </DropZoneStyle>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      {files.length > 0 && !isEdit && (
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button color="inherit" size="small" onClick={onRemoveAll}>
            Remove all
          </Button>
          {/* <Button size="small" variant="contained" onClick={onUpload}>
            Upload files
          </Button> */}
        </Stack>
      )}

      {helperText && helperText}
    </Box>
  );
}
