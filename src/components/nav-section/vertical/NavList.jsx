import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Collapse } from '@mui/material';
// hooks
import useActiveLink from '../../../hooks/useActiveLink';
//
import NavItem from './NavItem';
import { useParams } from 'react-router';

// ----------------------------------------------------------------------

NavList.propTypes = {
  data: PropTypes.object,
  depth: PropTypes.number,
  hasChild: PropTypes.bool,
};

export default function NavList({ data, depth, hasChild, onCloseNav }) {
  const { pathname } = useLocation();
  const params = useParams();

  let formatPathname = pathname;
  if (formatPathname.includes(Object.values(params)?.[0])) {
    formatPathname = formatPathname.replace(`/${Object.values(params)?.[0]}`, '');
  }

  let { active, isExternalLink } = useActiveLink(data.path);

  if (data?.activePaths) {
    active = [data.path, ...(data?.activePaths || [])].includes(formatPathname);
  }

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!active) {
      handleClose();
      onCloseNav?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleToggle = (e) => {
    setOpen(!open);
  };

  const handleClose = () => {
    setOpen(false);
  };

  console.log('openopen', open);

  return (
    <>
      <NavItem
        item={data}
        depth={depth}
        open={open}
        active={active}
        isExternalLink={isExternalLink}
        onClick={handleToggle}
      />

      {hasChild && (
        <Collapse in={open} unmountOnExit>
          <NavSubList data={data.children} depth={depth} />
        </Collapse>
      )}
    </>
  );
}

// ----------------------------------------------------------------------

NavSubList.propTypes = {
  data: PropTypes.array,
  depth: PropTypes.number,
};

function NavSubList({ data, depth }) {
  return (
    <>
      {data.map((list) => (
        <NavList
          key={list.title + list.path}
          data={list}
          depth={depth + 1}
          hasChild={!!list.children}
        />
      ))}
    </>
  );
}
