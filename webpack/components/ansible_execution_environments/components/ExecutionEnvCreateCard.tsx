import React, { ReactElement } from 'react';
import {
  Bullseye,
  Card,
  CardBody,
  CardHeader,
  Tooltip,
} from '@patternfly/react-core';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import { ExecutionEnvironmentDraft } from '../../../types/AnsibleExecutionEnvTypes';
import { useAdContext } from '../../../helpers/adContext';
import { ExecutionEnvCardShell } from './ExecutionEnvCardShell';
import { ExecutionEnvCardActions } from './ExecutionEnvCardActions';
import {
  allExecutionEnvFields,
  executionEnvCardConfigs,
} from './executionEnvCardConfig';
import {
  ExecutionEnvFieldsForm,
  ExecutionEnvNameField,
  isDraftValid,
} from './ExecutionEnvFieldsForm';

interface ExecutionEnvCreateCardProps {
  createEnvAction: (draft: ExecutionEnvironmentDraft) => Promise<void>;
  createModeOverride: boolean;
}

export const ExecutionEnvCreateCard = ({
  createEnvAction,
  createModeOverride,
}: ExecutionEnvCreateCardProps): ReactElement => {
  const ctx = useAdContext();

  const emptyDraft = (): ExecutionEnvironmentDraft => ({
    name: '',
    ansible_version: ctx.settings.ansible_director_default_ansible_core_version,
    container_image_url:
      ctx.settings.ansible_director_default_container_image_url,
  });

  const [createMode, setCreateMode] = React.useState<boolean>(
    createModeOverride
  );
  const [draft, setDraft] = React.useState<ExecutionEnvironmentDraft>(
    emptyDraft
  );

  const reset = (): void => {
    setDraft(emptyDraft());
    setCreateMode(false);
  };

  if (!createMode) {
    return (
      <Tooltip content={<div>{_('Create new Execution Environment')}</div>}>
        <Card ouiaId="BasicCard" isClickable isRounded isLarge>
          <CardHeader>
            <div className="pf-v5-c-card__actions">
              <div className="pf-v5-c-card__selectable-actions">
                <div className="pf-v5-c-radio pf-m-standalone">
                  <input
                    type="radio"
                    id="card-select-mode"
                    className="pf-v5-c-radio__input"
                    onClick={e => {
                      e.stopPropagation();
                      setCreateMode(true);
                    }}
                    style={{
                      position: 'absolute',
                      clipPath: 'inset(100%)',
                    }}
                  />
                  <label
                    className="pf-v5-c-radio__label"
                    onClick={e => {
                      e.stopPropagation();
                      setCreateMode(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Bullseye>
              <PlusIcon style={{ width: '100px', height: '100px' }} />
            </Bullseye>
          </CardBody>
        </Card>
      </Tooltip>
    );
  }

  return (
    <ExecutionEnvCardShell
      actions={
        <ExecutionEnvCardActions
          mode="edit"
          config={executionEnvCardConfigs.image_build}
          inputValid={isDraftValid(draft, allExecutionEnvFields)}
          onSave={async () => {
            await createEnvAction(draft);
            reset();

            return true;
          }}
          onAbort={reset}
        />
      }
      title={
        <ExecutionEnvNameField
          isEditable
          name={draft.name}
          onChange={name => setDraft({ ...draft, name })}
        />
      }
    >
      <ExecutionEnvFieldsForm
        editableFields={allExecutionEnvFields}
        isEditing
        draft={draft}
        onChange={patch => setDraft({ ...draft, ...patch })}
      />
    </ExecutionEnvCardShell>
  );
};
