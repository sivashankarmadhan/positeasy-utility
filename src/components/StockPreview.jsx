import { Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { isEmpty, map } from 'lodash';

function StockPreview({ data }) {
  const format = () => {
    const formatted = [];
    map(data[0], (e, key) => {
      if (key !== 'id')
        formatted.push({
          headerName: key,
          field: key,
          minWidth: 100,
          flex: 1,
          headerClassName: 'super-app-theme--header',
        });
    });
    return formatted;
  };

  return (
    <div style={{ height: 'auto', width: '100%' }}>
      {!isEmpty(data) ? (
        <DataGrid
          className="step5"
          rowHeight={40}
          rows={data}
          columns={format()}
          disableRowSelectionOnClick
          localeText={{ noRowsLabel: 'No  stocks found' }}
        />
      ) : (
        <Typography
          noWrap
          variant="subtitle2"
          sx={{
            color: 'text.secondary',
            position: 'absolute',
            top: '37%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          No Stock Report found
        </Typography>
      )}
    </div>
  );
}

export default StockPreview;
