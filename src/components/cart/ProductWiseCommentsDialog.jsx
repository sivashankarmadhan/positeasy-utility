import React, { useState } from 'react';
import GetAdditionalInformationDialog from 'src/components/GetAdditionalInformationDialog';
import { get } from 'lodash';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import PostAddIcon from '@mui/icons-material/PostAdd';

const ProductWiseCommentsDialog = ({ item, handleSubmit }) => {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState('');

  const theme = useTheme();

  return (
    <Box key={item.cartId}>
      <Tooltip title="Add information">
        <PostAddIcon
          style={{
            marginRight: '5px',
            cursor: 'pointer',
            color: get(item, '_additionalInfo') ? theme.palette.primary.main : '#370525',
            fontSize: '18px',
          }}
          className="hover-primary"
          onClick={() => setOpen(true)}
        />
      </Tooltip>

      <GetAdditionalInformationDialog
        open={open}
        handleClose={() => setOpen(false)}
        info={info}
        setInfo={setInfo}
        isProductwise={true}
        handleSubmit={handleSubmit}
        itemInfo={get(item, '_additionalInfo')}
      />
    </Box>
  );
};
export default ProductWiseCommentsDialog;
