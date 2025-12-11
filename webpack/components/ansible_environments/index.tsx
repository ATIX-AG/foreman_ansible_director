import React, { ReactElement } from 'react';
import AnsibleEnvironmentsPageWrapper from './AnsibleEnvironmentsPageWrapper';
import { AdContextWrapper } from '../common/AdContextWrapper';

export const WrappedAnsibleEnvironmentsPage = (): ReactElement => (
  <AdContextWrapper>
    <AnsibleEnvironmentsPageWrapper />
  </AdContextWrapper>
);
