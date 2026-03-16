import React, { Dispatch, SetStateAction } from 'react';
import {
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  TextInput,
  Form,
  FormGroup,
  Popover,
} from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../../types/AnsibleExecutionEnvTypes';
import { ExecutionEnvCardHeaderActions } from './ExecutionEnvCardHeaderActions';
import { TextInputEditable } from './components/TextInputEditable';

interface ExecutionEnvEditCardProps {
  editMode: boolean;
  executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate;
  handleEdit: () => Promise<void>;
  handleDestroy: () => void;
  onAnsibleVersionChange: (ansibleVersion: string) => void;
  onBaseImageUrlChange: (baseImageUrl: string) => void;
  onNameChange: (name: string) => void;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ExecutionEnvEditCard = ({
  editMode,
  executionEnvironment,
  handleEdit,
  handleDestroy,
  onAnsibleVersionChange,
  onBaseImageUrlChange,
  onNameChange,
  setIsContentUnitModalOpen,
}: ExecutionEnvEditCardProps): React.ReactElement => {
  return (
    <Card ouiaId="BasicCard" isLarge isRounded>
      <CardHeader
        actions={{
          actions: (
            <ExecutionEnvCardHeaderActions
              editMode={editMode}
              handleDestroy={handleDestroy}
              handleEdit={handleEdit}
              executionEnvironment={executionEnvironment}
            />
          ),
        }}
        type="text"
        readOnlyVariant={editMode ? undefined : 'plain'}
        aria-label={_('Environment Name')}
        id="ansible-dir-ex-env-edit-card"
      />
    </CardTitle>
    <CardBody>
      <Form isHorizontal>
        <FormGroup label={_('Base image URL')}>
          <TextInputEditable
            isEditable={editMode}
            value={executionEnvironment.base_image_url}
            setValue={(_event, value) => {
              onBaseImageUrlChange(value);
            }}
          />
        </FormGroup>
        <FormGroup
          label={_('Ansible version')}
          labelIcon={
            <Popover
              headerContent={<div>ansible-core version</div>}
              bodyContent={
                <div>
                  {_(
                    'The ansible-core version for this Execution Environment.\n' +
                      'As ansible-core is installed from PyPi, the version must match one of '
                  )}
                  <a
                    href="https://pypi.org/project/ansible-core/#history"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {_('the available releases.')}
                  </a>
                </div>
              }
            >
              <button
                type="button"
                aria-label={_('More info for unit id field')}
                onClick={e => e.preventDefault()}
                aria-describedby="content-unit-identifier-field-01"
                className={styles.formGroupLabelHelp}
              >
                <HelpIcon />
              </button>
            </Popover>
          }
        >
          <TextInputEditable
            isEditable={editMode}
            value={executionEnvironment.ansible_version}
            setValue={(_event, value) => {
              onAnsibleVersionChange(value);
            }}
          />
        </FormGroup>
        {/*          <FormGroup label="Baked content"> TODO: evaluate whether this feature should be exposed to users
            <Bullseye>
              <Button
                variant="control"
                onClick={() => {
                  setIsContentUnitModalOpen(true);
                  setSelectedEnv(executionEnvironment);
                }}
              >
                {_('Assign content units')}
              </Button>
            </Bullseye>
          </FormGroup> */}
      </Form>
    </CardBody>
  </Card>
);
