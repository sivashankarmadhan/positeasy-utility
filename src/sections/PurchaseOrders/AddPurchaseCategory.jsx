import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Dialog, Stack, Typography } from '@mui/material';
import UploadImage from 'src/components/upload/UploadImage';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ErrorConstants } from 'src/constants/ErrorConstants';
import PRODUCTS_API from 'src/services/products';
import { SuccessConstants } from 'src/constants/SuccessConstants';
import { S3Service } from 'src/services/S3Service';
import { get, isArray, isEmpty, isEqual, map, trim } from 'lodash';
import getClone from 'src/utils/getClone';

function AddPurchaseCategory({
  isOpenAddCategoryModal,
  closeCategoryModal,
  editCategory,
  categoryId,
  initialFetch,
}) {
  const editCategoryWithoutCategoryId = getClone(editCategory);
  delete editCategoryWithoutCategoryId?.editCategory;
  const schema = Yup.object().shape({
    categoryName: Yup.string().required('Name is required'),
    image: Yup.mixed().nullable(),
  });

  const defaultValues = {
    categoryName: '',
    description: '',
    image: null,
  };

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: categoryId ? editCategory : defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, errors },
    clearErrors,
  } = methods;
  const values = watch();

  const onSubmit = async (data) => {
    try {
      let imageData = {};
      if (typeof get(data, 'image') === 'object' && get(data, 'image') !== null) {
        const linkResponse = await S3Service.getPurchaseCategoryImageLink();

        const payload = {
          s3URL: get(linkResponse, 'data.URL'),
          file: get(data, 'image'),
        };

        const imageResponse = await S3Service.sendFile(payload);

        imageData = { image: get(imageResponse, 'url').split('?')[0] };
      }

      if (!isEmpty(editCategory)) {
        const response = await PRODUCTS_API.editPurchaseCategory(
          {
            ...data,
            categoryId: data,
            ...imageData,
          },
          editCategory?.categoryId
        );

        if (response) toast.success(SuccessConstants.UPDATED_SUCCESSFULLY);
      } else if (isEmpty(editCategory)) {
        await PRODUCTS_API.addPurchaseCategory({
          ...data,
          ...imageData,
          categoryName: data?.categoryName?.trim(),
        });
        toast.success(SuccessConstants.SAVE_SUCCESSFUL);
      }
      initialFetch();
      closeCategoryModal();
    } catch (err) {
      toast.error(get(err, 'message', ErrorConstants.SOMETHING_WRONG));
    }
  };

  return (
    <Dialog open={isOpenAddCategoryModal}>
      <FormProvider methods={methods} onSubmit={handleSubmit((data) => onSubmit(data, reset))}>
        <Card sx={{ p: 2, width: { xs: 325, sm: 500 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Category
          </Typography>
          <Stack gap={2}>
            <Stack sx={{ flexDirection: { xs: 'column', sm: 'row' } }} gap={2}>
              <RHFTextField
                size="small"
                label={
                  <div>
                    Name <span style={{ color: 'red' }}>*</span>
                  </div>
                }
                disabled={categoryId}
                name="categoryName"
                sx={{ width: '100%' }}
              />
            </Stack>
            <RHFTextField
              size="small"
              label="Description"
              name="description"
              multiline
              rows={5}
              sx={{ width: '100%' }}
            />

            <UploadImage name={'image'} setValue={setValue} values={values} />
          </Stack>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={2} mt={2}>
            <Button size="large" variant="text" onClick={closeCategoryModal}>
              Cancel
            </Button>
            <LoadingButton size="large" type="submit" variant="contained" loading={isSubmitting}>
              Submit
            </LoadingButton>
          </Stack>
        </Card>
      </FormProvider>
    </Dialog>
  );
}

export default AddPurchaseCategory;
