import React, { ReactElement } from 'react';
import { useAPI } from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { translate as _ } from 'foremanReact/common/I18n';
import { AnsibleLce } from '../../../../../types/AnsibleEnvironmentsTypes';
import { LceContentList } from './LceContentList';

interface LceContentListWrapperProps {
  lceId: number;
}

export const LceContentListWrapper = ({
  lceId,
}: LceContentListWrapperProps): ReactElement | null => {
  const showLceResponse = useAPI<AnsibleLce>(
    'get',
    foremanUrl(`/api/v2/ansible_director/lifecycle_environments/${lceId}`)
  );

  if (showLceResponse.status === 'RESOLVED') {
    return <LceContentList lce={showLceResponse.response} />;
  } else if (showLceResponse.status === 'ERROR') {
    // TODO: Handle request error
    return null;
  }

  return (
    <EmptyPage
      message={{
        type: 'loading',
        text: _('Loading lifecycle environment...'),
      }}
    />
  );
};
