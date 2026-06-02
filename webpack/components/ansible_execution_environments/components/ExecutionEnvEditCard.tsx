import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  FormEvent,
} from 'react';
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

type ValidationState = 'success' | 'warning' | 'error' | 'default';

interface ExecutionEnvEditCardProps {
  editMode: boolean;
  executionEnvironment: AnsibleExecutionEnv | AnsibleExecutionEnvCreate;
  handleEdit: () => Promise<void>;
  handleDestroy: () => void;
  onAnsibleVersionChange: (ansibleVersion: string) => void;
  onBaseImageUrlChange: (baseImageUrl: string) => void;
  onNameChange: (name: string) => void;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
  handleAbort: () => void;
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
  handleAbort,
}: ExecutionEnvEditCardProps): React.ReactElement => {
  const getDefaultState = (value: string): ValidationState => {
    if (editMode) return value === '' ? 'default' : 'success';
    return 'default';
  };

  const [validateName, setValidateName] = useState<ValidationState>(
    getDefaultState(executionEnvironment.name)
  );

  const [validateBaseImageUrl, setValidateBaseImageUrl] = useState<
    ValidationState
  >(getDefaultState(executionEnvironment.base_image_url));

  const [validateAnsibleVersion, setValidateAnsibleVersion] = useState<
    ValidationState
  >(getDefaultState(executionEnvironment.ansible_version));

  useEffect(() => {
    setValidateName(getDefaultState(executionEnvironment.name));
    setValidateBaseImageUrl(
      getDefaultState(executionEnvironment.base_image_url)
    );
    setValidateAnsibleVersion(
      getDefaultState(executionEnvironment.ansible_version)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  const handleNameChange = (
    _event: FormEvent<HTMLInputElement>,
    name: string
  ): void => {
    onNameChange(name);

    setValidateName(name === '' ? 'error' : 'success');
  };

  const handleBaseImageChange = (
    _event: FormEvent<HTMLInputElement>,
    baseImageUrl: string
  ): void => {
    onBaseImageUrlChange(baseImageUrl);

    setValidateBaseImageUrl(baseImageUrl === '' ? 'error' : 'success');
  };

  const handleAnsibleVersionChange = (
    _event: FormEvent<HTMLInputElement>,
    version: string
  ): void => {
    onAnsibleVersionChange(version);

    setValidateAnsibleVersion(version === '' ? 'error' : 'success');
  };

  return (
    <Card ouiaId="BasicCard" isLarge isRounded>
      <CardHeader
        actions={{
          actions: (
            <ExecutionEnvCardHeaderActions
              inputValid={
                validateName === 'success' &&
                validateAnsibleVersion === 'success' &&
                validateBaseImageUrl === 'success'
              }
              editMode={editMode}
              handleDestroy={handleDestroy}
              handleEdit={handleEdit}
              executionEnvironment={executionEnvironment}
              handleAbort={handleAbort}
            />
          ),
        }}
      />
      <CardTitle>
        <TextInput
          validated={validateName}
          className="pf-v5-c-card__title-text"
          value={executionEnvironment.name}
          onChange={handleNameChange}
          type="text"
          readOnlyVariant={editMode ? undefined : 'plain'}
          aria-label={_('Environment Name')}
          id="ansible-dir-ex-env-edit-card"
          placeholder={_('Execution Environment Name')}
        />
      </CardTitle>
      <CardBody>
        <Form isHorizontal>
          <FormGroup label={_('Base image URL')} isRequired={editMode}>
            <TextInputEditable
              validated={validateBaseImageUrl}
              isEditable={editMode}
              value={executionEnvironment.base_image_url}
              setValue={handleBaseImageChange}
            />
          </FormGroup>
          <FormGroup
            label={_('Ansible version')}
            isRequired={editMode}
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
              validated={validateAnsibleVersion}
              isEditable={editMode}
              value={executionEnvironment.ansible_version}
              setValue={handleAnsibleVersionChange}
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
};
