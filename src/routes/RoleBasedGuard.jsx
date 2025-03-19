import { Fragment } from 'react';

import { m } from 'framer-motion';
import PropTypes from 'prop-types';
// @mui
import { Container, Typography } from '@mui/material';
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import AuthService from 'src/services/authService';
import { ForbiddenIllustration } from '../assets/illustrations';

// ----------------------------------------------------------------------

RoleBasedGuard.propTypes = {
  children: PropTypes.node,
  hasContent: PropTypes.bool,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default function RoleBasedGuard({ roles, children,isNotAuth }) {
  const role = AuthService.getCurrentRoleInLocal();
  const canAccess = roles?.includes?.(role);
  if (!canAccess || isNotAuth) {
    return (
      <Container component={MotionContainer} sx={{ textAlign: 'center' }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            Permission Denied
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Typography sx={{ color: 'text.secondary' }}>
            You do not have permission to access this page
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <ForbiddenIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    );
  }
  if (canAccess) {
    return <Fragment>{children}</Fragment>;
  }
}
