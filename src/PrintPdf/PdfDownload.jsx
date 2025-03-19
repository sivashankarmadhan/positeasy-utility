import { IconButton, useTheme } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

export default function PdfDownload({ printPdf, isUnderWeekDatesBol }) {
  const theme = useTheme();

  return (
    <IconButton
      disabled={!isUnderWeekDatesBol}
      onClick={printPdf}
      sx={
        isUnderWeekDatesBol
          ? { color: theme.palette.primary.main }
          : { opacity: 0.5, color: 'gray' }
      }
    >
      <PictureAsPdfIcon />
    </IconButton>
  );
}
