import React, { useState, useEffect } from 'react';
import Skeleton from '@mui/material/Skeleton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';

const ItemListSkeletonLoader = () => {
    return (
      <List>
        {Array.from(new Array(4)).map((_, index) => (
          <ListItem key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <ListItemAvatar>
              <Skeleton variant="circular" width={56} height={56} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton variant="text" width={150} />}
              secondary={<Skeleton variant="text" width={80} />}
            />
            <Skeleton variant="text" width={30} height={30} />
          </ListItem>
        ))}
      </List>
    );
  };
  export default ItemListSkeletonLoader;