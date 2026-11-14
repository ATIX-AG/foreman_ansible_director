import React, { ReactElement } from 'react';

import {
  ExecutionEnvironment,
  ExecutionEnvironmentDraft,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCardConfig } from './executionEnvCardConfig';
import { ExecutionEnvCardShell } from './ExecutionEnvCardShell';
import { ExecutionEnvCardActions } from './ExecutionEnvCardActions';
import {
  ExecutionEnvFieldsForm,
  ExecutionEnvNameField,
  isDraftValid,
} from './ExecutionEnvFieldsForm';

interface ExecutionEnvEditableCardProps {
  executionEnv: ExecutionEnvironment;
  config: ExecutionEnvCardConfig;
  onDelete: () => void;
  onSave: (draft: ExecutionEnvironmentDraft) => Promise<boolean>;
}

const toDraft = (
  executionEnv: ExecutionEnvironment
): ExecutionEnvironmentDraft => ({
  name: executionEnv.name,
  container_image_url: executionEnv.container_image_url,
  ansible_version: executionEnv.ansible_version,
});

export const ExecutionEnvEditableCard = ({
  executionEnv,
  config,
  onDelete,
  onSave,
}: ExecutionEnvEditableCardProps): ReactElement => {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<ExecutionEnvironmentDraft>(
    () => toDraft(executionEnv)
  );

  const startEdit = (): void => {
    setDraft(toDraft(executionEnv));
    setEditing(true);
  };

  const abortEdit = (): void => {
    setDraft(toDraft(executionEnv));
    setEditing(false);
  };

  const saveEdit = async (): Promise<void> => {
    const saved = await onSave(draft);
    if (saved) {
      setEditing(false);
    }
  };

  const nameEditable =
    editing && config.editableFields.includes('name');

  const actions = editing
    ? (
      <ExecutionEnvCardActions
        mode="edit"
        config={config}
        inputValid={isDraftValid(draft, config.editableFields)}
        onSave={saveEdit}
        onAbort={abortEdit}
      />
    )
    : (
      <ExecutionEnvCardActions
        mode="view"
        config={config}
        executionEnv={executionEnv}
        onDelete={onDelete}
        onEdit={startEdit}
      />
    );

  return (
    <ExecutionEnvCardShell
      actions={actions}
      title={
        <ExecutionEnvNameField
          isEditable={nameEditable}
          name={(editing ? draft : executionEnv).name}
          onChange={name => setDraft({ ...draft, name })}
        />
      }
    >
      <ExecutionEnvFieldsForm
        editableFields={config.editableFields}
        isEditing={editing}
        draft={editing ? draft : executionEnv}
        onChange={patch => setDraft({ ...draft, ...patch })}
      />
    </ExecutionEnvCardShell>
  );
};
