import React, { PropsWithChildren, CSSProperties, ReactElement } from 'react';

import SimpleBarReact from 'simplebar-react';

export default function CustomScrollbar({ children, scrollableNodeProps, ...rest }) {
  return (
    <SimpleBarReact scrollableNodeProps={scrollableNodeProps} {...rest}>
      {children}
    </SimpleBarReact>
  );
}
