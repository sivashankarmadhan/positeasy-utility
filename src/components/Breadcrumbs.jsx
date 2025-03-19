import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Box, Link, Typography, Breadcrumbs as MUIBreadcrumbs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@poriyaalar/custom-hooks';

// ----------------------------------------------------------------------

Breadcrumbs.propTypes = {
  activeLast: PropTypes.bool,
  links: PropTypes.array.isRequired,
};

export default function Breadcrumbs({ links, activeLast = false, ...other }) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const currentLink = links[links.length - 1].name;

  const listDefault = links.map((link) => <LinkItem key={link.name} link={link} />);

  const listActiveLast = links.map((link) => (
    <div key={link.name}>
      {link.name !== currentLink ? (
        <LinkItem link={link} />
      ) : (
        <Typography
          variant="body2"
          sx={{
            mt:'2px',
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis',
            fontSize: isMobile ? '0.5rem' : '0.7rem',
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <MUIBreadcrumbs
      separator={
        <Box
          component="span"
          sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }}
        />
      }
      {...other}
    >
      {activeLast ? listDefault : listActiveLast}
    </MUIBreadcrumbs>
  );
}

// ----------------------------------------------------------------------

LinkItem.propTypes = {
  link: PropTypes.shape({
    href: PropTypes.string,
    icon: PropTypes.any,
    name: PropTypes.string,
  }),
};

function LinkItem({ link }) {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { href, name, icon } = link;
  return (
    <Link
      key={name}
      variant="body2"
      component={RouterLink}
      to={href || '#'}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.primary.main,
        '& > div': { display: 'inherit' },
        fontSize: isMobile ? '0.5rem' : '0.7rem',
      }}
    >
      {icon && <Box sx={{ mr: 1, '& svg': { width: 20, height: 20 } }}>{icon}</Box>}
      {name}
    </Link>
  );
}
