import {
  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  Grid,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { clone, debounce, find, findIndex, get, isEmpty, map, some } from 'lodash';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { StatusConstants, hideScrollbar } from 'src/constants/AppConstants';
import { alertDialogInformationState, currentStoreId } from 'src/global/recoilState';
import RAW_PRODUCTS_API from 'src/services/rawproducts';
import S3ImageCaching from './S3ImageCaching';
import Label from './label';
import ConfirmIngredientDialog from './ConfirmIngredientDialog';
import CloseIcon from '@mui/icons-material/Close';
import { Close } from '@mui/icons-material';

export default function LinkIngredientDialog(props) {
  const { open, handleClose, productData, syncUpProducts } = props;
  
  const { productId } = productData;
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
  const [quantity, setQuantity] = useState(0);



  
  const setAlertDialogInformation = useSetRecoilState(alertDialogInformationState);
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
  const handleEditSelectedProduct = (e) => {
    const ingredient = find(selectedProducts, (d) => get(d, 'productId') === get(e, 'productId'));
    setQuantity(get(ingredient, 'quantity'));
    setOpenQuantity({ isOpen: true, data: ingredient });
  };
  const handleRemoveSelectedProduct = (e) => {
    setSelectedProducts((prevState) => {
      const index = findIndex(prevState, (d) => get(d, 'productId') === get(e, 'productId'));
      if (index !== -1) {
        const currentState = [...prevState]
        currentState.splice(index, 1); 
        return currentState;
      }
      return prevState;
    });
  };
  
  const handleDeleteAllProduct = () => {
    const alertDialogInformation = {
      open: true,
      title: 'Confirm !',
      subtitle: `Are you sure You want to remove the ingredients from ${get(
        productData,
        'name'
      )} ?`,
      actions: {
        primary: {
          text: 'Delete',
          onClick: (onClose) => {
            handleDeleteIngredient(onClose);
          },
          sx: {
            backgroundColor: theme.palette.error.main,
            '&:hover': {
              backgroundColor: theme.palette.error.main,
            },
          },
        },
        secondary: {
          text: 'Cancel',
          onClick: (onClose) => {
            onClose();
          },
          sx: {
            color: '#000',
          },
        },
      },
    };
    setAlertDialogInformation(alertDialogInformation);
  };
  const handleDeleteIngredient = async (onClose) => {
    try {
      const response = await RAW_PRODUCTS_API.removeIngredients(get(productData, 'productId'));
      if (response) toast.success(`Ingredient removed from ${get(productData, 'name')}`);
      getPreviousIngredients();
      onClose();
      handleReset();
    } catch (e) {
      console.log(e);
    }
  };
  const handleReset = () => {
    setSelectedProducts([]);
    setQuantity(0);
    setOpenConfirm(false);
    setOpenQuantity(defaultQuantityValue);
    setFilterCategory('');
    setLink(false);
  };
  const handleFilterByName = debounce((event) => {
    setPage(0);
    getIngredients(event.target.value);
  }, 1000);

  const handleFilterByCategory = (value) => {
    setPage(0);
    setFilterCategory(value);
  };

  const getPreviousIngredients = async () => {
    try {
      const response = await RAW_PRODUCTS_API.getIngredients(productId);
      console.log(response);
      setPreviousIngredients(get(response, 'data.0.rawIngredients', []));
    } catch (error) {
      console.log(error);
    }
  };
  const getIngredients = async (filterName) => {
    try {
      let options = {
        page: page + 1,
        size: size,
        status: [StatusConstants.ACTIVE],
        prodName: filterName,
        category: filterCategory,
      };
      const response = await RAW_PRODUCTS_API.getProducts(options);
      setTotalIngredients(get(response, 'data.data', []));
      setTotal(get(response, 'data.totalItems', 0));
    } catch (error) {
      console.log(error);
    }
  };
  const getCategories = async () => {
    try {
      const response = await RAW_PRODUCTS_API.getCategories();
      setCategoriesList(get(response, 'data', []));
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
  if (quantity > '0') {
    let options = {
      ...e,
      quantity: quantity,
    };
    handleAddSelectedProduct(options);
    handleCloseQuantity();
  } else {
    toast.error("Quantity must be greater than 0");
  }
};

  useEffect(() => {
    if (!isEmpty(previousIngredients)) setSelectedProducts(previousIngredients);
  }, [previousIngredients]);
  useEffect(() => {
    if (link) getIngredients();
  }, [link, page, size, filterCategory]);
  useEffect(() => {
    getCategories();
  }, []);
  useEffect(() => {
    if (get(productData, 'productId')) getPreviousIngredients();
  }, [productData]);
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
          <Typography variant="h6">{get(productData, 'name')}</Typography>
          {!link ? (
            <Stack sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
              <Button
                onClick={() => setLink(!link)}
                variant={
                  isEmpty(previousIngredients) || isEmpty(selectedProducts)
                    ? 'contained'
                    : 'outlined'
                }
              >
                {link
                  ? 'Cancel'
                  : isEmpty(previousIngredients) || isEmpty(selectedProducts)
                  ? 'Add'
                  : 'Edit'}
              </Button>
              {!isEmpty(previousIngredients) && (
                <Button color="error" onClick={handleDeleteAllProduct} variant={'outlined'}>
                  Delete
                </Button>
              )}
              <Tooltip title="Close">
                <IconButton
                  sx={{ color: theme.palette.main, height: 40 }}
                  onClick={() => handleClose()}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Tooltip title="Close">
              <IconButton
                sx={{ color: theme.palette.main, height: 40 }}
                onClick={() => handleClose()}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {link ? (
          <>
            <Stack sx={{ width: '100%' }} flexDirection={'row'} gap={1}>
              <TextField
                onChange={handleFilterByName}
                fullWidth
                variant="outlined"
                label="Search"
                size="small"
              />
              <Autocomplete
                onChange={(event, value) => handleFilterByCategory(value)}
                size="small"
                fullWidth
                value={filterCategory}
                disablePortal
                id="combo-box-demo"
                options={categoriesList}
                renderInput={(params) => <TextField {...params} label="Category" />}
              />
            </Stack>
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
                      {isAdded(get(e, 'productId')) ? (
                        <Stack flexDirection={'row'} gap={1}>
                          <Button
                            color="warning"
                            size="small"
                            variant="outlined"
                            onClick={() => handleEditSelectedProduct(e)}
                          >
                            Edit
                          </Button>
                          <Button
                            color="error"
                            size="small"
                            variant="contained"
                            onClick={() => handleRemoveSelectedProduct(e)}
                          >
                            Remove
                          </Button>
                        </Stack>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleOpenQuantity(e)}
                        >
                          Add
                        </Button>
                      )}
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
            {isEmpty(previousIngredients) ? (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography>No Ingredients Linked</Typography>
              </Box>
            ) : (
              <>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  Ingredients
                </Typography>
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
                  {map(previousIngredients, (e) => (
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

                        <Label
                          capitalize={false}
                          variant="soft"
                          color="success"
                          sx={{ fontSize: '15px' }}
                        >
                          {get(e, 'quantity')} {get(e, 'unitName')}
                        </Label>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
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
         
          <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Enter Quantity
          </Typography>
          <Tooltip title="Close">
            <IconButton
              sx={{ color: theme.palette.main, height: 40 }}
              onClick={() => handleClose()}
            >
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>
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
      <ConfirmIngredientDialog
        open={openConfirm}
        handleClose={() => setOpenConfirm(false)}
        productData={productData}
        selectedProducts={selectedProducts}
        setSelectedProducts={setSelectedProducts}
        previousIngredients={previousIngredients}
        getPreviousIngredients={getPreviousIngredients}
        handleReset={handleReset}
      />
    </Dialog>
  );
}
