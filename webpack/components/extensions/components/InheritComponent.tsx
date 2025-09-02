import React, { ReactElement } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import CheckIcon from '@patternfly/react-icons/dist/esm/icons/check-icon';
/* eslint-disable camelcase */
import global_success_color_100 from '@patternfly/react-tokens/dist/esm/global_success_color_100';

interface InheritComponentProps {
  hostgroupName?: string;
}

export const InheritComponent = ({
  hostgroupName,
}: InheritComponentProps): ReactElement => (
  <EmptyState>
    <EmptyStateHeader
      titleText={
        hostgroupName
          ? `Inheriting Ansible content from Hostgroup: "${hostgroupName}"`
          : 'Inheriting Ansible content from Hostgroup'
      }
      headingLevel="h4"
      icon={
        <EmptyStateIcon icon={CheckIcon} color={global_success_color_100.var} />
      }
    />
    <EmptyStateBody>
      This host will inherit Ansible content from the selected Hostgroup.
    </EmptyStateBody>
  </EmptyState>
);
