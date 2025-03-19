import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { get, isEmpty, map } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import StockPreview from './StockPreview';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { base64_images } from 'src/constants/ImageConstants';
import { Stack, Tooltip, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import PRODUCTS_API from 'src/services/products';
import LoadingScreen from './loading-screen/LoadingScreen';
import { generateFilename } from 'src/helper/generateFilename';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenStockView(props) {
  const { open, handleClose } = props;
  const [data, setData] = useState([]);
  const [formatted, setFormatted] = useState([]);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleExportPDF = async () => {
    try {
      const fileName = generateFilename('Inventory');
      const doc = new jsPDF();

      // Table header
      const headers = [map(formatted[0], (e, key) => key)];

      // Table rows
      const rows = map(formatted, (item) => map(item, (value, key) => value));
      // doc.text('POSITEASY', 10, 10);
      doc.addImage(base64_images.Logo_pos, 10, 10, 35, 8);
      doc.text('STOCK REPORT', 80, 20);

      // Add table to the document
      doc.autoTable({
        startY: 25,
        head: headers,
        body: rows,
        headStyles: { fillColor: [90, 11, 69] },
      });

      doc.save(`${fileName}.pdf`);
    } catch (e) {
      console.log(e);
    }
  };

  const handleExportExcel = async (e) => {
    try {
      const fileName = generateFilename('Inventory');

      const wb = await XLSX.utils.book_new();
      const ws = await XLSX.utils.json_to_sheet(formatted);
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
  const formatData = () => {
    const formattedData = [];
    map(data, (e) => {
      formattedData.push({
        id: get(e, 'productId'),
        'Product Name': get(e, 'name'),
        Unit: get(e, 'unit') ? `${get(e, 'unit')}${get(e, 'unitName')}` : '-',
        Category: get(e, 'category'),
        'Price(₹)': get(e, 'price'),

        GST: get(e, 'GSTPercent') > 0 ? get(e, 'GSTPercent') : '-',

        'Offer price(₹)': get(e, 'offerPrice'),
        'Stock monitor': get(e, 'stockMonitor') ? 'On' : 'Off',
        'Stock quantity': get(e, 'stockQuantity') ? get(e, 'stockQuantity', '-') : '-',
      });
      setFormatted(formattedData);
    });
  };
  const getStock = async () => {
    try {
      setIsLoading(true);
      const response = await PRODUCTS_API.getStocks();
      if (response) setData(get(response, 'data'));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      if (!isEmpty(data)) {
        formatData();
      }
    }, 100);
  }, [data]);
  useEffect(() => {
    getStock();
  }, []);
  if (isLoading) return <LoadingScreen />;
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
      sx={{
        '& .super-app-theme--header': {
          backgroundColor: theme.palette.primary.lighter,
          color: theme.palette.primary.main,
        },
      }}
    >
      <AppBar sx={{ position: 'relative', displayPrint: 'none' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Preview
          </Typography>

          <Stack flexDirection={'row'} gap={1}>
            <Tooltip title="Download invetory as PDF">
              <IconButton
                onClick={handleExportPDF}
                disabled={isEmpty(data)}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
              >
                <Icon
                  style={{ ...(isEmpty(data) ? { opacity: 0.5 } : {}) }}
                  icon="vscode-icons:file-type-pdf2"
                />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download invetory as Excel">
              <IconButton
                sx={{ '&:hover': { backgroundColor: theme.palette.primary.light } }}
                onClick={handleExportExcel}
                disabled={isEmpty(data)}
              >
                <Icon
                  style={{ ...(isEmpty(data) ? { opacity: 0.5 } : {}) }}
                  icon="vscode-icons:file-type-excel"
                />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>
      {formatted && <StockPreview data={formatted} />}
    </Dialog>
  );
}
