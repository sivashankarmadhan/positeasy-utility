import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { isEmpty, map } from 'lodash';
import { useEffect } from 'react';

export default function Categories({
  categoriesList,
  isInventoryFlow,
  handleChangeCategoriesProducts,
  categorizedProduct,
}) {
  const theme = useTheme();

  useEffect(() => {
    if (!categorizedProduct && !isEmpty(categoriesList)) {
      handleChangeCategoriesProducts(categoriesList[0]);
    }
  }, [categoriesList]);

  return (
    <Paper
      sx={{
        top: 55,

        width: isInventoryFlow
          ? '100%'
          : {
              xs: '97%',
              md: '65%',
              lg: '66%',
              sm: '97%',
            },
        position: 'absolute',
        zIndex: 99,
        alignContent: 'flex-end',
        alignSelf: 'flex-end',
        py: '10px',
        left: '0px',
        pl: 1.5,
        pr: 1,
        backgroundColor: '#F8F8F8 !important',
        '& .MuiList-root': {
          backgroundColor: '#F8F8F8 !important',
          py: '10px',
        },
      }}
    >
      <Stack
        flexDirection={'row'}
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
          gap: 2,
        }}
      >
        {map(categoriesList, (category) => (
          <Box id={`${category}-category`}>
            <Typography
              onClick={() => {
                handleChangeCategoriesProducts(category);
              }}
              variant="subtitle1"
              noWrap
              sx={{
                color: categorizedProduct === category ? '#fff' : '#000',
                fontFamily: 'monospace',
                textAlign: 'center',
                borderRadius: 2,
                px: 4,
                py: 0.7,
                backgroundColor:
                  categorizedProduct === category ? theme.palette.primary.main : '#fff',
                borderColor: categorizedProduct !== category ? theme.palette.primary.main : '',
              }}
            >
              {category.toLocaleUpperCase()}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
