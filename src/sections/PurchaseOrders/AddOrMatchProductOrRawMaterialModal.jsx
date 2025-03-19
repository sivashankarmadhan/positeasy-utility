import {
  Button,
  Card,
  Dialog,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { capitalize, lowerCase } from 'lodash';
import { get } from 'lodash';
import React from 'react';
import { useState } from 'react';
import { PURCHASE_STOCK_ADD_OR_MATCH } from 'src/constants/AppConstants';

const AddOrMatchProductOrRawMaterialModal = ({
  isOpenAddOrMatchModal,
  setIsOpenAddOrMatchModal,
  manualEntryStocks,
  currentStock,
  selectedProductOrRawMaterial,
  onSubmit,
}) => {
  const theme = useTheme();
  const [selectedRadio, setSelectedRadio] = useState(PURCHASE_STOCK_ADD_OR_MATCH.ADD);

  const addResult = currentStock + get(selectedProductOrRawMaterial, 'quantity');

  const matchResult =
    manualEntryStocks - currentStock + get(selectedProductOrRawMaterial, 'quantity');

  return (
    <Dialog
      open={isOpenAddOrMatchModal}
    >
      <Card sx={{ p: 2, width: { xs: 340, sm: 500 } }}>
        <FormControl sx={{ height: 200 }}>
          <RadioGroup
            value={selectedRadio}
            onChange={(event) => {
              setSelectedRadio(event.target.value);
            }}
            sx={{ px: 2 }}
          >
            <FormControlLabel
              value={PURCHASE_STOCK_ADD_OR_MATCH.ADD}
              control={<Radio />}
              label={
                <Typography sx={{ fontWeight: 'bold' }}>
                  Add {lowerCase(get(selectedProductOrRawMaterial, 'type'))} in current stock
                </Typography>
              }
            />

            <Stack mb={4}>
              <Typography>
                Current Stock (<span style={{ fontWeight: 'bold' }}>{currentStock}</span>) +
                Purchase {capitalize(get(selectedProductOrRawMaterial, 'type'))}&nbsp;Stock (
                <span style={{ fontWeight: 'bold' }}>
                  {get(selectedProductOrRawMaterial, 'quantity')}
                </span>
                ) ={' '}
                <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {addResult}
                </span>
              </Typography>
            </Stack>

            <FormControlLabel
              value={PURCHASE_STOCK_ADD_OR_MATCH.MATCH}
              control={<Radio />}
              label={
                <Typography sx={{ fontWeight: 'bold' }}>
                  Match {lowerCase(get(selectedProductOrRawMaterial, 'type'))} in Manual Entry
                  Stocks
                </Typography>
              }
            />

            <Stack>
              <Typography>
                Manual Entry Stocks (<span style={{ fontWeight: 'bold' }}>{manualEntryStocks}</span>
                ) + Current Stock (<span style={{ fontWeight: 'bold' }}>{currentStock}</span>) -
                Purchase {capitalize(get(selectedProductOrRawMaterial, 'type'))}&nbsp;Stock (
                <span style={{ fontWeight: 'bold' }}>
                  {get(selectedProductOrRawMaterial, 'quantity')}
                </span>
                ) ={' '}
                <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  {matchResult}
                </span>
              </Typography>
            </Stack>
          </RadioGroup>
        </FormControl>

        <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
          <Button
            size="large"
            variant="text"
            onClick={() => {
              setIsOpenAddOrMatchModal(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="button"
            variant="contained"
            onClick={() => {
              if (selectedRadio === PURCHASE_STOCK_ADD_OR_MATCH.ADD) {
                onSubmit(addResult);
              } else if (PURCHASE_STOCK_ADD_OR_MATCH.MATCH) {
                onSubmit(matchResult);
              }
            }}
          >
            Submit
          </Button>
        </Stack>
      </Card>
    </Dialog>
  );
};

export default AddOrMatchProductOrRawMaterialModal;
