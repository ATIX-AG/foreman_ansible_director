import React, { ReactElement, ReactNode } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';

interface ExecutionEnvCardShellProps {
  actions: ReactNode;
  title: ReactNode;
  children: ReactNode;
}

export const ExecutionEnvCardShell = ({
  actions,
  title,
  children,
}: ExecutionEnvCardShellProps): ReactElement => (
  <Card ouiaId="BasicCard" isLarge isRounded>
    <CardHeader actions={{ actions }} />
    <CardTitle>{title}</CardTitle>
    <CardBody>{children}</CardBody>
  </Card>
);
