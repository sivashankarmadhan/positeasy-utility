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
import toast from 'react-hot-toast';
import PRODUCTS_API from 'src/services/products';
import ExcelPreview from './ExcelPreview';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import ProductLoader from './ProductLoader';
import { IMPORT_EXPORT_TOOLBAR } from 'src/constants/AppConstants';
import { useRecoilValue } from 'recoil';
import { currentStoreId } from 'src/global/recoilState';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog(props) {
  const { open, handleClose, file, forUpload = 'inventory', intialFetch } = props;

  const currentStore = useRecoilValue(currentStoreId);
  const [data, setData] = React.useState(null);
  const [formattedData, setFormattedData] = useState([]);
  const [loading, setLoading] = useState(false);
  async function convertToJSON(data, type) {
    if (!currentStore) return;
    try {
      if (!data) return;

      const isCsv = get(file, 'type')?.includes('csv');
      const headers = isCsv ? data[0] : data[5];
      const jsonData = [];
      for (
        let i = isCsv ? (IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY === forUpload ? 1 : 2) : 7;
        i < data.length;
        i++
      ) {
        const row = data[i];
        const entry = {};

        for (let j = 0; j < headers.length; j++) {
          entry[headers[j]] = row[j];
        }

        jsonData.push({ ...entry });
      }
      let options = [];
      map(jsonData, (e) => {
        if (!isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.REPORT) {
          options.push({
            Date: get(e, 'Date'),
            Timestamp: get(e, 'Timestamp'),
            'Invoice No.': get(e, 'Invoice No.'),
            'Payment Type': get(e, 'Payment Type'),
            'Order Type': get(e, 'Order Type'),
            'Item Name': get(e, 'Item Name'),
            Price: get(e, 'Price'),
            'Qty.': get(e, 'Qty.'),
            'Sub Total': get(e, 'Sub Total'),
            Discount: get(e, 'Discount'),
            Tax: get(e, 'Tax'),
            'Final Total': get(e, 'Final Total'),
            Status: get(e, 'Status'),
            'Server Name': get(e, 'Server Name'),
            Covers: get(e, 'Covers'),
            Category: get(e, 'Category'),
            'Non Taxable': get(e, 'Non Taxable'),
          });
        }
        if (isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY) {
          options.push({
            name: get(e, 'Name'),
            price: get(e, 'Price'),
            description: get(e, 'Description', ''),
            category: get(e, 'Category'),
            attributes: get(e, 'Attributes'),
          });
        }

        if (isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY) {
          options.push({
            productId: get(e, 'productId'),
            shortCode: get(e, 'shortCode'),
            name: get(e, 'name'),
            description: get(e, 'description'),
            basePrice: get(e, 'basePrice'),
            price: get(e, 'price'),
            category: get(e, 'category')?.toUpperCase(),
            tag: get(e, 'tag'),
            attributes: get(e, 'attributes'),
            discount: get(e, 'discount'),
            offerPrice: get(e, 'offerPrice'),
            stockMonitor: get(e, 'stockMonitor'),
            stockQuantity: get(e, 'stockQuantity'),
            unitsEnabled: get(e, 'unitsEnabled'),
            unit: get(e, 'unit'),
            unitName: get(e, 'unitName'),
            counter: get(e, 'counter'),
            GSTPercent: get(e, 'GSTPercent'),
            GSTInc: get(e, 'GSTInc'),
          });
        }
      });
      return { actualData: jsonData, options: options };
    } catch (e) {
      console.log(e);
    }
  }
  const handleReset = () => {
    setFormattedData([]);
    setData(null);
    handleClose();
  };
  const handleComplete = async () => {
    const isCsv = get(file, 'type')?.includes('csv');

    try {
      setLoading(true);
      if (isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.PARTNER_INVENTORY) {
        const response = await PRODUCTS_API.addPartnerInventory(get(formattedData, 'options'));
        if (response) {
          toast.success('Inventory Added');
          handleReset();
          intialFetch();
        }
      }
      if (isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.IMPORT_INVENTORY) {
        const response = await PRODUCTS_API.importInventory(get(formattedData, 'options'));
        if (response) {
          toast.success('Inventory Added');
          handleReset();
          intialFetch();
        }
      }
      if (!isCsv && forUpload === IMPORT_EXPORT_TOOLBAR.REPORT) {
        const response = await PRODUCTS_API.addPartnerReport(get(formattedData, 'actualData'));
        if (response) {
          toast.success('Report Added');
          handleReset();
        }
      }
      setLoading(false);
      handleClose();
    } catch (e) {
      console.log(e);
      toast.error(e?.errorResponse?.message || ErrorConstants.SOMETHING_WRONG);
    }
  };
  const convertData = async () => {
    if (!currentStore) return;
    try {
      const sortedData = await convertToJSON(data);
      setFormattedData(sortedData);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    convertData();
  }, [file, data, currentStore]);
  return (
    <Dialog fullScreen open={open}  TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Preview
          </Typography>
          <Button disabled={isEmpty(data)} autoFocus color="inherit" onClick={handleComplete}>
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      {loading && <ProductLoader />}
      {file && !loading && (
        <ExcelPreview file={file} data={get(formattedData, 'options')} setData={setData} />
      )}
    </Dialog>
  );
}
