import React from 'react';
import { Stack, StackItem, Divider } from '@patternfly/react-core';

import {
  AnsibleLce,
  AnsibleLcePath,
} from '../../../types/AnsibleEnvironmentsTypes';
import { AnsibleLcePathComponent } from './components/AnsibleLcePathComponent';

import { AnsibleLibraryOverview } from './components/AnsibleLibraryOverview';
import { ContentUnitModal } from '../../ansible_execution_environments/components/ContentUnitModal';

interface AnsibleLcePathIndexProps {
  lcePaths: AnsibleLcePath[];
  refreshRequest: () => void;
}

export const AnsibleLcePathIndex: React.FC<AnsibleLcePathIndexProps> = ({
  lcePaths,
  refreshRequest,
}) => {
  const [isContentUnitModalOpen, setIsContentUnitModalOpen] = React.useState<
    boolean
  >(false);

  const [lifecycleEnv, setLifecycleEnv] = React.useState<
    AnsibleLce | undefined
  >();

  return (
    <>
      <Stack>
        <StackItem
          style={{
            padding: '10px 20px 10px 20px',
          }}
        >
          <AnsibleLibraryOverview />
        </StackItem>
        <Divider component="div" style={{ padding: '10px 20px 10px 20px' }} />
        {lcePaths.map(lcePath => (
          <StackItem
            style={{
              padding: '10px 20px 10px 20px',
            }}
          >
            <AnsibleLcePathComponent
              lcePath={lcePath}
              refreshRequest={refreshRequest}
              setIsContentUnitModalOpen={setIsContentUnitModalOpen}
              setLifecycleEnv={setLifecycleEnv}
            />
          </StackItem>
        ))}
      </Stack>
      {lifecycleEnv && (
        <ContentUnitModal
          isContentUnitModalOpen={isContentUnitModalOpen}
          setIsContentUnitModalOpen={setIsContentUnitModalOpen}
          target={lifecycleEnv}
          setTarget={setLifecycleEnv}
          refreshRequest={refreshRequest}
        />
      )}
    </>
  );
};
