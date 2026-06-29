import React, { Dispatch, ReactElement, SetStateAction } from 'react';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Popover,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import { AnsibleContentUnitCreateType } from '../../../AnsibleContentWizard';

interface IdentifierInputProps {
  identifier: string;
  setIdentifier: Dispatch<SetStateAction<string>>;
  unitType: 'role' | 'collection';
  contentUnits: AnsibleContentUnitCreateType[];
  identifierValidation: ValidatedOptions;
  setIdentifierValidation: Dispatch<SetStateAction<ValidatedOptions>>;
}

export const IdentifierInput = ({
  identifier,
  setIdentifier,
  unitType,
  contentUnits,
  identifierValidation,
  setIdentifierValidation,
}: IdentifierInputProps): ReactElement => {
  const [
    identifierValidationHelperText,
    setIdentifierValidationHelperText,
  ] = React.useState<string>('');

  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ): void => {
    let helperText: string;
    let validationState: ValidatedOptions;

    if (name === '') {
      helperText = __(_('%(uType)s identifier may not be empty.'), {
        uType: unitType === 'collection' ? 'Collection' : 'Role',
      });
      validationState = ValidatedOptions.error;
    } else if (!new RegExp('^[a-z0-9_]+\\.[a-z0-9_]+$').test(name)) {
      helperText = __(
        _('%(uType)s identifier does not match /^[a-z0-9_]+\\.[a-z0-9_]+$/.'),
        { uType: unitType === 'collection' ? 'Collection' : 'Role' }
      );
      validationState = ValidatedOptions.error;
    } else if (
      contentUnits.some(
        unit => unit.identifier === name && unit.type === unitType
      )
    ) {
      helperText = `${
        unitType === 'collection' ? 'Collection' : 'Role'
      } already in batch. If version sets differ, their union will be used!`;
      validationState = ValidatedOptions.warning;
    } else {
      validationState = ValidatedOptions.success;
      helperText = '';
    }

    setIdentifier(name);
    setIdentifierValidation(validationState);
    setIdentifierValidationHelperText(helperText);
  };

  return (
    <FormGroup
      label={_('Identifier')}
      isRequired
      fieldId="content-unit-form-01"
      labelIcon={
        <Popover
          alertSeverityVariant="info"
          headerContent={
            <div>
              {__(_('The identifier of an Ansible %(uType)s.'), {
                uType: unitType,
              })}
            </div>
          }
          bodyContent={<div />}
        >
          <button
            type="button"
            aria-label={_('More info for identifier field')}
            onClick={e => e.preventDefault()}
            aria-describedby="content-unit-identifier-field-01"
            className={styles.formGroupLabelHelp}
          >
            <HelpIcon />
          </button>
        </Popover>
      }
    >
      <TextInput
        isRequired
        type="text"
        id="content-unit-id-input-01"
        value={identifier}
        onChange={handleNameChange}
        validated={identifierValidation}
      />
      {identifierValidation === ValidatedOptions.error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{identifierValidationHelperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};
