import { Button, Card, Dialog, Stack, TextField, Typography } from '@mui/material';
import { filter, find, findIndex, get, isEmpty, map, some, sortBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import ExpenseServices from 'src/services/API/ExpenseServices';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import { useRecoilState, useRecoilValue } from 'recoil';
import { allConfiguration, currentStoreId } from 'src/global/recoilState';
import SettingServices from 'src/services/API/SettingServices';
import PRODUCTS_API from 'src/services/products';
import getClone from 'src/utils/getClone';

export default function CategoryRankingDialog(props) {
  const { open, handleClose, viewMode, handleCloseView } = props;
  const currentStore = useRecoilValue(currentStoreId);

  const ALL = 'all';
  const [configuration, setConfiguration] = useRecoilState(allConfiguration);
  const previousRankingList = get(configuration, 'categoryRanking.categoryRank', []);
  const isAllAlready = some(previousRankingList, (e) => e.category === ALL);
  const [categoryRank, setCategoryRank] = useState(
    isAllAlready ? previousRankingList : [...previousRankingList, { category: ALL, rank: 0 }]
  );

  const [finalCategoryRank, setFinalCategoryRank] = useState([]);

  const getCategoryList = async () => {
    try {
      const response = await PRODUCTS_API.getProductCategoryList();
      const format = map(get(response, 'data'), (e, index) => {
        return {
          category: e,
          rank: index + 1,
        };
      });
      const isAllAlready = some(format, (e) => e.category === ALL);
      setCategoryRank(isAllAlready ? format : [...format, { category: ALL, rank: 0 }]);
    } catch (error) {
      toast.error(error?.message ?? ErrorConstants.SOMETHING_WRONG);
    }
  };
  useEffect(() => {
    if (currentStore) getCategoryList();
  }, [currentStore]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let cloneCategoryRank = getClone(isEmpty(finalCategoryRank) ? categoryRank : finalCategoryRank);

    const findDataIndex = findIndex(cloneCategoryRank, (d) => d.category === name);
    if (findDataIndex > -1) {
      const copyData = cloneCategoryRank[findDataIndex];
      cloneCategoryRank[findDataIndex] = { ...copyData, rank: Number(value) };
      setFinalCategoryRank(cloneCategoryRank);
    }
  };

  const handleSubmit = async () => {
    try {
      const options = {
        categoryRanking: {
          isActive: true,
          categoryRank: isEmpty(finalCategoryRank) ? categoryRank : finalCategoryRank,
        },
      };
      const response = await SettingServices.postConfiguration(options);
      if (response) toast.success('Ranking Updated');
      setFinalCategoryRank([]);
      handleClose();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!isEmpty(previousRankingList)) {
      setCategoryRank(
        isAllAlready ? previousRankingList : [...previousRankingList, { category: ALL, rank: 0 }]
      );
    }
  }, [configuration, open, viewMode]);

  return (
    <Dialog open={open || viewMode}>
      <Card sx={{ p: 2, width: { xs: 320, sm: 500 }, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Category Ranking
        </Typography>
        {!viewMode ? (
          <>
            {map(categoryRank, (e, index) => (
              <Stack
                key={index}
                flexDirection={'row'}
                justifyContent={'space-between'}
                marginBottom={1}
              >
                <Typography>{e.category} </Typography>
                <TextField
                  defaultValue={e.rank}
                  name={e.category}
                  placeholder={e.category}
                  type="number"
                  sx={{ width: 100 }}
                  size="small"
                  onChange={handleChange}
                />
              </Stack>
            ))}

            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 2,
                gap: 1,
              }}
            >
              <Button onClick={handleClose} variant="contained">
                Cancel
              </Button>
              <Button onClick={handleSubmit} variant="contained">
                Ok
              </Button>
            </Stack>
          </>
        ) : (
          <>
            {map(categoryRank, (e, index) => (
              <Stack
                key={index}
                flexDirection={'row'}
                justifyContent={'space-between'}
                marginBottom={1}
              >
                <Typography>{e.category} </Typography>
                <Typography>{e.rank} </Typography>
              </Stack>
            ))}
            <Stack
              flexDirection={'row'}
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 2,
                gap: 1,
              }}
            >
              <Button onClick={handleCloseView} variant="contained">
                Close
              </Button>
              <Button onClick={() => handleCloseView('edit')} variant="contained">
                Edit
              </Button>
            </Stack>
          </>
        )}
      </Card>
    </Dialog>
  );
}
