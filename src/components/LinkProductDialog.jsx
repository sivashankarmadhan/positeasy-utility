import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  Grid,
  InputAdornment,
  OutlinedInput,
  Stack,
  TablePagination,
  TextField,
  Typography,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material';
import { clone, debounce, find, findIndex, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { StatusConstants, hideScrollbar } from 'src/constants/AppConstants';
import {
  alertDialogInformationState,
  currentStoreId,
  currentRawProduct,
  currentProduct,
} from 'src/global/recoilState';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import S3ImageCaching from './S3ImageCaching';
import Label from './label';
import ConfirmIngredientDialog from './ConfirmIngredientDialog';
import CloseIcon from '@mui/icons-material/Close';
import RawMaterial from 'src/sections/RawMaterials/RawMaterial';

export default function LinkProductDialog(props) {
  const { open, handleClose, productData, syncUpProducts } = props;
  const theme = useTheme();
  const currentStore = useRecoilValue(currentStoreId);
  const [totalIngredients, setTotalIngredients] = useState([]);
  const [previousIngredients, setPreviousIngredients] = useState([]);
  const [link, setLink] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const defaultQuantityValue = { isOpen: false, data: {} };
  const [openQuantity, setOpenQuantity] = useState({ isOpen: false, data: {} });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [linkedRawmaterial, setlinkedRawmaterial] = useState();
  const [quantity, setQuantity] = useState(0);
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
  const [currentProductData, setCurrentProduct] = useRecoilState(currentProduct);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setSize(parseInt(event.target.value, 10));
  };

  const handleAddSelectedProduct = (e) => {
    setSelectedProducts((prevState) => {
      const index = findIndex(prevState, (d) => get(d, 'productId') === get(e, 'productId'));
      const currentState = clone(prevState);
      if (index !== -1) {
        currentState[index] = e;
        return currentState;
      } else {
        currentState.push(e);
        return currentState;
      }
    });
  };

  const showLinkedProduct = async () => {
    try {
      const options = {
        storeId: currentStore,
        rawMaterialId: get(currentProductData, 'productId'),
      };
      const response = await RAW_PRODUCTS_API.getLinkedProduct(options);
      setlinkedRawmaterial(get(response, 'data', []));
      console.log('oooresponse', response);
    } catch (error) {
      console.log(error);
    }
  };
  const isAdded = (productId) => {
    const isAlready = some(selectedProducts, (e) => get(e, 'productId') === productId);
    return isAlready;
  };
  const getSelected = (productId) => {
    const isAlready = find(selectedProducts, (e) => get(e, 'productId') === productId);
    return isAlready;
  };
  const handleOpenQuantity = (data) => {
    setOpenQuantity({ isOpen: true, data: data });
  };
  const handleCloseQuantity = () => {
    setOpenQuantity(defaultQuantityValue);
    setQuantity(0);
  };
  const handleChangeQuantity = (e) => {
    setQuantity(e.target.value);
  };
  const handleSubmitQuantity = (e) => {
    let options = {
      ...e,
      quantity: quantity,
    };
    handleAddSelectedProduct(options);
    handleCloseQuantity();
  };
  useEffect(() => {
    if (linkedRawmaterial) setSelectedProducts(linkedRawmaterial);
  }, [linkedRawmaterial]);

  useEffect(() => {
    if (get(currentProductData, 'productId')) showLinkedProduct();
  }, [currentProductData]);
 
  return (
    <Dialog open={open}>
      <Card
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: { xs: 320, sm: 450 },
          minHeight: 'calc(100vh - 10rem)',
        }}
      >
        <Stack flexDirection={'row'} justifyContent={'space-between'} sx={{ width: '100%' }}>
          <Typography variant="h6">{get(currentProductData, 'name')}</Typography>
          <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
            <Tooltip title="Close">
              <IconButton
                sx={{ color: theme.palette.main, height: 40 }}
                onClick={() => handleClose()}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        {link ? (
          <>
            <Box sx={{ width: '100%', mt: 1, mb: 12, overflowY: 'scroll', ...hideScrollbar }}>
              <Grid direction={'column'} container sx={{ width: '100%', mt: 1, gap: 1 }}>
                {map(totalIngredients, (e) => (
                  <Grid
                    sm={12}
                    lg={12}
                    xs={12}
                    item
                    sx={{
                      border: 1,
                      borderColor: alpha(
                        theme.palette.primary.main,
                        theme.palette.action.selectedOpacity
                      ),
                      p: 1,

                      borderRadius: 1,
                    }}
                  >
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Stack sx={{ flexDirection: 'row', display: 'flex', gap: 1 }}>
                        <div style={{ width: 50, height: 50, borderRadius: 10 }}>
                          <S3ImageCaching src={get(e, 'productImage')} alt={get(e, 'name')} />
                        </div>
                        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography sx={{ fontSize: '15px', fontWeight: 'bold' }}>
                            {get(e, 'name')}
                          </Typography>
                          {!isEmpty(getSelected(get(e, 'productId'))) && (
                            <div>
                              <Label
                                capitalize={false}
                                color="success"
                                sx={{ fontSize: '15px', fontWeight: 'bold' }}
                              >
                                {get(getSelected(get(e, 'productId')), 'quantity')}
                                {get(getSelected(get(e, 'productId')), 'unitName')?.toLowerCase()}
                              </Label>
                            </div>
                          )}
                        </Stack>
                      </Stack>
                      
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              <TablePagination
                sx={{
                  position: 'absolute',
                  bottom: 40,
                  display: 'flex',
                  justifyContent: 'center',
                  width: '93%',
                }}
                component="div"
                count={total}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={size}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              <Stack
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  position: 'absolute',
                  bottom: 10,
                  justifyContent: 'flex-end',
                  width: '93%',
                }}
              >
                <Button
                  sx={{ px: 4 }}
                  onClick={() => setLink(!link)}
                  variant="outlined"
                  color="error"
                >
                  {link ? 'Cancel' : 'Add'}
                </Button>
                {!isEmpty(selectedProducts) && (
                  <Button sx={{ px: 4 }} onClick={() => setOpenConfirm(true)} variant="contained">
                    Submit
                  </Button>
                )}
              </Stack>
            </Box>{' '}
          </>
        ) : (
          <>
            {isEmpty(linkedRawmaterial) && (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography>No Products Linked</Typography>
              </Box>
            )}
            <>
              <Grid
                container
                sx={{
                  width: '100%',
                  mb: 1,
                  mt: 1,
                  maxHeight: 'calc(100vh - 10rem)',
                  overflowY: 'scroll',
                  gap: 1,
                  ...hideScrollbar,
                }}
              >
                {map(linkedRawmaterial, (e) => (
                  <Grid item xs={12} sm={12} lg={12}>
                    <Stack
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                      sx={{ border: `1px dashed green`, borderRadius: 1, p: 1 }}
                    >
                      <Stack flexDirection={'row'}>
                        <div style={{ width: 50, height: 50, borderRadius: 10 }}>
                          <S3ImageCaching src={get(e, 'productImage')} alt={get(e, 'name')} />
                        </div>
                        <Stack
                          flexDirection={'column'}
                          sx={{ display: 'flex', justifyContent: 'space-between', ml: 1 }}
                        >
                          <Typography sx={{ fontSize: '15px' }}>{get(e, 'name')}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </>
          </>
        )}
      </Card>

      <Dialog open={get(openQuantity, 'isOpen', false)}>
        <Card
          sx={{
            padding: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Enter Quantity
          </Typography>

          <OutlinedInput
            value={quantity}
            onChange={handleChangeQuantity}
            type="number"
            variant="outlined"
            size="small"
            sx={{ mb: 1 }}
            endAdornment={
              <InputAdornment position="end">
                {get(openQuantity, 'data.unitName', '')}
              </InputAdornment>
            }
          />
          <Button
            onClick={() => handleSubmitQuantity(get(openQuantity, 'data'))}
            variant="contained"
          >
            Submit
          </Button>
        </Card>
      </Dialog>
    </Dialog>
  );
}
