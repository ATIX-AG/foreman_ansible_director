import React, { ReactElement } from 'react';
import AnsibleContentPageWrapper from './AnsibleContentPageWrapper';
import { AdContextWrapper } from '../common/AdContextWrapper';

export const WrappedAnsibleContentPage = (): ReactElement => (
  <AdContextWrapper>
    <AnsibleContentPageWrapper />
  </AdContextWrapper>
);
