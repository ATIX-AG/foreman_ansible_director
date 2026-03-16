import React, { Dispatch, SetStateAction, useEffect } from 'react';

import { ExecutionEnvEditCard } from './ExecutionEnvEditCard';

import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';

interface ExecutionEnvCardProps {
  executionEnv: AnsibleExecutionEnv;
  handleDestroy: (env: AnsibleExecutionEnv) => void;
  handleUpdate: (env: AnsibleExecutionEnv) => void;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ExecutionEnvCard: React.FC<ExecutionEnvCardProps> = ({
  executionEnv,
  handleDestroy,
  handleUpdate,
  setSelectedEnv,
  setIsContentUnitModalOpen,
}) => {
  const [editMode, setEditMode] = React.useState<boolean>(false);
  const [executionEnvironment, setExecutionEnvironment] = React.useState<
    AnsibleExecutionEnv
  >(executionEnv);

  useEffect(() => {
    setExecutionEnvironment(executionEnv);
  }, [executionEnv]);

  const askConfirmUpdate = async (): Promise<void> => {
    setSelectedEnv(executionEnvironment);
    if (editMode) {
      if (
        JSON.stringify(executionEnv) !== JSON.stringify(executionEnvironment)
      ) {
        executionEnvironment && handleUpdate(executionEnv);
      }
    }
    setEditMode(!editMode);
  };

  const askConfirmDestroy = (): void => {
    setSelectedEnv(executionEnv);
    handleDestroy(executionEnv);
  };

  if (!executionEnvironment) {
    return null;
  }

  return (
    <ExecutionEnvEditCard
      editMode={editMode}
      executionEnvironment={executionEnvironment}
      handleEdit={askConfirmUpdate}
      handleDestroy={askConfirmDestroy}
      onNameChange={(name: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          name,
        });
      }}
      onBaseImageUrlChange={(baseImageUrl: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          base_image_url: baseImageUrl,
        });
      }}
      onAnsibleVersionChange={(ansibleVersion: string) => {
        setExecutionEnvironment({
          ...executionEnvironment,
          ansible_version: ansibleVersion,
        });
      }}
      setIsContentUnitModalOpen={setIsContentUnitModalOpen}
    />
  );
};
