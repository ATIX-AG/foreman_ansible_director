import React, { ReactElement } from 'react';

import {
  ExecutionEnvironment,
  ExecutionEnvironmentDraft,
} from '../../../types/AnsibleExecutionEnvTypes';
import { executionEnvCardConfigs } from './executionEnvCardConfig';
import { ExecutionEnvEditableCard } from './ExecutionEnvEditableCard';

interface ExecutionEnvCardProps {
  executionEnv: ExecutionEnvironment;
  onDelete: () => void;
  onSave: (draft: ExecutionEnvironmentDraft) => Promise<boolean>;
}

export const ExecutionEnvCard = ({
  executionEnv,
  onDelete,
  onSave,
}: ExecutionEnvCardProps): ReactElement | null => {
  const config = executionEnvCardConfigs[executionEnv.source];

  return (
    <ExecutionEnvEditableCard
      executionEnv={executionEnv}
      config={config}
      onDelete={onDelete}
      onSave={onSave}
    />
  );
};
