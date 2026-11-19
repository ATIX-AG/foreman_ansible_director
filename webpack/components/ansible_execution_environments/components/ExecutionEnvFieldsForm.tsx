import React, { ReactElement } from 'react';
import { Form, FormGroup, Popover, TextInput } from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { translate as _ } from 'foremanReact/common/I18n';

import { ExecutionEnvironmentDraft } from '../../../types/AnsibleExecutionEnvTypes';
import { TextInputEditable } from './components/TextInputEditable';
import { ExecutionEnvField } from './executionEnvCardConfig';
import { pfValidationState } from '../../../types/common';

const fieldValidation = (
  value: string | null,
  isEditable: boolean
): pfValidationState => {
  if (!isEditable) {
    return 'default';
  }

  return value === null || value === '' ? 'error' : 'success';
};

export const isDraftValid = (
  draft: ExecutionEnvironmentDraft,
  editableFields: readonly ExecutionEnvField[]
): boolean =>
  editableFields.every(
    field => draft[field] !== null && draft[field] !== ''
  );

interface ExecutionEnvNameFieldProps {
  isEditable: boolean;
  name: string;
  onChange: (name: string) => void;
}

export const ExecutionEnvNameField = ({
  isEditable,
  name,
  onChange,
}: ExecutionEnvNameFieldProps): React.ReactElement => (
  <TextInput
    validated={fieldValidation(name, isEditable)}
    value={name}
    onChange={(_event, value) => onChange(value)}
    readOnlyVariant={isEditable ? undefined : 'plain'}
    aria-label={_('Execution Environment Name')}
    placeholder={_('Execution Environment Name')}
  />
);

const ansibleVersionHelp: ReactElement = (
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
      aria-label={_('More info for ansible version field')}
      onClick={e => e.preventDefault()}
      className={styles.formGroupLabelHelp}
    >
      <HelpIcon />
    </button>
  </Popover>
);

interface ExecutionEnvFieldsFormProps {
  editableFields: readonly ExecutionEnvField[];
  isEditing: boolean;
  draft: ExecutionEnvironmentDraft;
  onChange: (patch: Partial<ExecutionEnvironmentDraft>) => void;
}

export const ExecutionEnvFieldsForm = ({
  editableFields,
  isEditing,
  draft,
  onChange,
}: ExecutionEnvFieldsFormProps): React.ReactElement => {
  const isFieldEditable = (field: ExecutionEnvField): boolean =>
    isEditing && editableFields.includes(field);

  const imageUrlEditable = isFieldEditable('container_image_url');
  const ansibleVersionEditable = isFieldEditable('ansible_version');

  return (
    <Form isHorizontal>
      <FormGroup label={_('Container image URL')} isRequired={imageUrlEditable}>
        <TextInputEditable
          validated={fieldValidation(draft.container_image_url, imageUrlEditable)}
          isEditable={imageUrlEditable}
          value={draft.container_image_url}
          setValue={(_event, value) => onChange({ container_image_url: value })}
        />
      </FormGroup>
      <FormGroup
        label={_('Ansible version')}
        isRequired={ansibleVersionEditable}
        labelIcon={
          editableFields.includes('ansible_version')
            ? ansibleVersionHelp
            : undefined
        }
      >
        <TextInputEditable
          validated={fieldValidation(draft.ansible_version, ansibleVersionEditable)}
          isEditable={ansibleVersionEditable}
          value={draft.ansible_version ?? _('Unknown')}
          setValue={(_event, value) => onChange({ ansible_version: value })}
        />
      </FormGroup>
    </Form>
  );
};
