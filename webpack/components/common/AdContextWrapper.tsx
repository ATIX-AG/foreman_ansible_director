import React, { createContext, ReactElement, useContext } from 'react';
import { useAPI, UseAPIReturn } from 'foremanReact/common/hooks/API/APIHooks';
import { translate as _ } from 'foremanReact/common/I18n';

import {
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';

interface AnsibleDirectorContext {
  settings: {
    // eslint-disable-next-line camelcase
    ad_default_galaxy_url: string;
    // eslint-disable-next-line camelcase
    ad_default_ansible_core_version: string;
  };
}

const defaultContext: AnsibleDirectorContext = {
  settings: {
    ad_default_galaxy_url: 'https://galaxy.ansible.com/',
    ad_default_ansible_core_version: '2.19.3',
  },
};

const AdContext = createContext<AnsibleDirectorContext>(defaultContext);

export const useAdContext = (): AnsibleDirectorContext => useContext(AdContext);

export interface AdContextWrapperProps {
  children: React.ReactNode;
}

export const AdContextWrapper = ({
  children,
}: AdContextWrapperProps): ReactElement => {
  const getStatusResponse: UseAPIReturn<AnsibleDirectorContext> = useAPI(
    'get',
    '/api/v2/ansible_director/status/context'
  );

  if (getStatusResponse.status === 'RESOLVED') {
    return (
      <AdContext.Provider value={getStatusResponse.response}>
        {children}
      </AdContext.Provider>
    );
  } else if (getStatusResponse.status === 'ERROR') {
    // TODO: Handle Error
  }

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={_('Loading Ansible context...')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={Spinner} />}
      />
    </EmptyState>
  );
};
