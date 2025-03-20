import {
  Card,
  Dialog,
  IconButton,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { get, isEmpty, map } from 'lodash';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const ViewTableDialog = ({ isOpen, onClose, data, title }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Card
        sx={{
          p: 2,
          width: { xs: '100%', sm: 450, md: 600, lg: 800 },
          maxWidth: '100%',
        }}
      >
        <Stack
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%', mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            {title}
          </Typography>

          <Stack flexDirection="row" alignItems="center" gap={1}>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>

        {!isEmpty(data) ? (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {map(Object.keys(data[0]), (_column) => (
                    <TableCell
                      align="left"
                      sx={{ fontWeight: 'bold', borderBottom: '1px solid #ced4da' }}
                    >
                      {_column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {map(data, (_item) => (
                  <TableRow sx={{ borderBottom: '1px solid #ced4da' }}>
                    {map(Object.keys(data[0]), (_column) => (
                      <TableCell align="left">{_item[_column]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack alignItems={'center'} justifyContent={'center'} height={'200px'}>
            <Typography fontWeight={700}>No Items Found</Typography>
          </Stack>
        )}
      </Card>
    </Dialog>
  );
};

export default ViewTableDialog;
