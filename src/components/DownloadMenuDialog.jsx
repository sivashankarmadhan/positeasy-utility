import { Icon } from '@iconify/react';
import { Card, Dialog, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { map } from 'lodash';
import CsvDownloadButton from 'react-json-to-csv';
import { base64_images } from 'src/constants/ImageConstants';
import { generateFilename } from 'src/helper/generateFilename';
import * as XLSX from 'xlsx';
import CloseIcon from '@mui/icons-material/Close';

export default function DownloadMenuDialog(props) {
  const { open, handleClose, data } = props;
  const theme = useTheme();

  const handleExportExcel = async () => {
    try {
      const fileName = generateFilename('Menu');

      const wb = await XLSX.utils.book_new();
      const ws = await XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'STOCK REPORT');

      // Generate the Excel file as an ArrayBuffer
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Convert the ArrayBuffer to a Blob
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.log(e);
    }
  };
  const handleExportPDF = async () => {
    try {
      const fileName = generateFilename('Menu');
      const doc = new jsPDF('landscape', 'in', [11.7, 16.5]);

      // Table header
      const headers = [map(data[0], (e, key) => key?.toLocaleUpperCase())];

      // Table rows
      const rows = map(data, (item) =>
        map(item, (value, key) => (typeof value === 'object' ? JSON.stringify(value) : value))
      );
      // doc.text('POSITEASY', 10, 10);
      doc.addImage(base64_images.Logo_pos, 1, 0, 2, 1);
      //   doc.text('MENU', 80, 20);

      // Add table to the document
      doc.autoTable({
        startY: 1,
        head: headers,
        body: rows,
        headStyles: { fillColor: [90, 11, 69] },
      });

      doc.save(`${fileName}.pdf`);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Dialog open={open}>
      <Card sx={{ p: 2, width: 340 }}>
        <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between',pb:'1',alignItems:'center' }}>
          <Typography variant="h6">
            Click to download menu below
          </Typography>

          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main,  }}
              onClick={() => handleClose()}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        {data ? (
          <Stack
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}
          >
            <button
              style={{
                color: '#5a0a4b',
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                fontSize: 'medium',
                border: '1px solid #5a0a4b',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleExportExcel}
            >
              <Icon icon="vscode-icons:file-type-excel" color="#0da14f" width="40" height="40" />
              <Typography sx={{ ml: 1, '&:hover': { textDecoration: 'underline' } }}>
                Menu.xlsx
              </Typography>
            </button>

            <CsvDownloadButton
              style={{
                color: '#5a0a4b',
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                fontSize: 'medium',
                border: '1px solid #5a0a4b',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              id="downloadMenu"
              data={data}
            >
              <Icon icon="iwwa:file-csv" color="#0da14f" width="40" height="40" />
              <Typography sx={{ ml: 1, '&:hover': { textDecoration: 'underline' } }}>
                Menu.csv
              </Typography>
            </CsvDownloadButton>

            <button
              style={{
                color: '#5a0a4b',
                backgroundColor: 'transparent',
                fontWeight: 'bold',
                fontSize: 'medium',
                border: '1px solid #5a0a4b',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleExportPDF}
            >
              <Icon icon="vscode-icons:file-type-pdf2" color="#0da14f" width="40" height="40" />
              <Typography sx={{ ml: 1, '&:hover': { textDecoration: 'underline' } }}>
                Menu.pdf
              </Typography>
            </button>
          </Stack>
        ) : (
          <Typography variant="h6" sx={{ mb: 2 }}>
            Data not found
          </Typography>
        )}
      </Card>
    </Dialog>
  );
}
