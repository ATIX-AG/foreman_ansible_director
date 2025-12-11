import React, { ReactElement } from 'react';
import AnsibleExecutionEnvPageWrapper from './AnsibleExecutionEnvPageWrapper';
import { AdContextWrapper } from '../common/AdContextWrapper';

export const WrappedAnsibleExecutionEnvPage = (): ReactElement => (
  <AdContextWrapper>
    <AnsibleExecutionEnvPageWrapper />
  </AdContextWrapper>
);
