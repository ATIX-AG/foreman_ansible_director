import React, { Dispatch, SetStateAction } from 'react';
import {
  ActionGroup,
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  Popover,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import UndoIcon from '@patternfly/react-icons/dist/esm/icons/undo-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import { AnsibleContentUnitCreate } from '../../../../../../types/AnsibleContentTypes';
import { VersionInput } from './components/VersionInput';

interface ContentUnitInputProps {
  contentUnits: Array<AnsibleContentUnitCreate>;
  setContentUnits: Dispatch<SetStateAction<Array<AnsibleContentUnitCreate>>>;
}

export const ContentUnitInput: React.FunctionComponent<ContentUnitInputProps> = ({
  contentUnits,
  setContentUnits,
}) => {
  const defaultGalaxy: string = 'https://galaxy.ansible.com/'; // TODO: Extract this from context; Assume valid

  const [contentUnitName, setContentUnitName] = React.useState<string>('');
  const [contentUnitValidation, setContentUnitValidation] = React.useState<
    ValidatedOptions
  >(ValidatedOptions.default);

  const [
    contentUnitValidationHelperText,
    setContentUnitValidationHelperText,
  ] = React.useState<string>('');

  const [contentUnitSource, setContentUnitSource] = React.useState(
    defaultGalaxy
  ); // TODO: Global default
  const [
    contentUnitSourceValidation,
    setContentUnitSourceValidation,
  ] = React.useState<ValidatedOptions>(ValidatedOptions.success);

  const [contentUnitVersions, setContentUnitVersions] = React.useState<
    Array<string>
  >([]);

  const [unitType, setUnitType] = React.useState<'collection' | 'role'>(
    'collection'
  );

  // TODO: Do I still need this
  // eslint-disable-next-line no-unused-vars
  const handleUnitTypeChange = (
    _event: React.FormEvent<HTMLInputElement>
  ): void => {
    if (unitType === 'collection') {
      setUnitType('role');
    } else {
      setUnitType('collection');
    }
  };

  const handleNameChange = (
    _event: React.FormEvent<HTMLInputElement>,
    name: string
  ): void => {
    let helperText: string;
    let validationState: ValidatedOptions;

    if (name === '') {
      helperText = `${
        unitType === 'collection' ? 'Collection' : 'Role'
      } identifier may not be empty!`;
      validationState = ValidatedOptions.error;
    } else if (!new RegExp('^[a-z0-9_]+\\.[a-z0-9_]+$').test(name)) {
      helperText = `${
        unitType === 'collection' ? 'Collection' : 'Role'
      } identifier does not match /^[a-z0-9_]+\\.[a-z0-9_]+$/!`;
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

    setContentUnitName(name);
    setContentUnitValidation(validationState);
    setContentUnitValidationHelperText(helperText);
  };

  const handleUnitSourceChange = (
    _event: React.FormEvent<HTMLInputElement>,
    sourceUrl: string
  ): void => {
    const validSource = new RegExp('^https?:\\/\\/.*\\/$').test(sourceUrl);

    setContentUnitSourceValidation(
      validSource ? ValidatedOptions.success : ValidatedOptions.error
    );
    setContentUnitSource(sourceUrl);
  };

  const addToBatch = (_event: never): void => {
    const unit: AnsibleContentUnitCreate = {
      type: unitType,
      identifier: contentUnitName,
      source: contentUnitSource,
      versions: contentUnitVersions.map(versionString => ({
        version: versionString,
      })),
    };
    setContentUnitName('');
    setContentUnitValidation(ValidatedOptions.default);
    setContentUnitValidationHelperText('');
    setContentUnitVersions([]);
    setContentUnits(oldUnits => [...oldUnits, unit]);
  };

  return (
    <Form>
      {/* <FormGroup */}
      {/*  role="radiogroup" */}
      {/*  fieldId="basic-form-radio-group" */}
      {/*  label="Unit type" */}
      {/*  isInline */}
      {/* > */}
      {/*  <Radio */}
      {/*    isChecked={unitType === 'collection'} */}
      {/*    name="collection-radio" */}
      {/*    onChange={handleUnitTypeChange} */}
      {/*    label="Collection" */}
      {/*    id="collection-radio-01" */}
      {/*  /> */}
      {/*  <Radio */}
      {/*    isChecked={unitType === 'role'} */}
      {/*    name="role-radio" */}
      {/*    onChange={handleUnitTypeChange} */}
      {/*    label="Role" */}
      {/*    id="role-radio-01" */}
      {/*  /> */}
      {/* </FormGroup> */}
      <FormGroup
        label={`${
          unitType === 'collection' ? 'Collection' : 'Role'
        } Indentifier`}
        isRequired
        fieldId="content-unit-form-01"
        labelIcon={
          <Popover
            headerContent={<div>The identifier of an Ansible {unitType}.</div>}
            bodyContent={<div>$namespace.$name</div>}
          >
            <button
              type="button"
              aria-label="More info for unit id field"
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
          value={contentUnitName}
          onChange={handleNameChange}
          validated={contentUnitValidation}
        />
        {contentUnitValidation === ValidatedOptions.error && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{contentUnitValidationHelperText}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
      <FormGroup
        label={`${unitType === 'collection' ? 'Collection' : 'Role'} Source`}
        fieldId="cu-source-01"
      >
        <InputGroup>
          <InputGroupItem isFill>
            <TextInput
              value={contentUnitSource}
              onChange={handleUnitSourceChange}
              id="cu-source-input-01"
              type="text"
              aria-label="content unit source input"
              validated={contentUnitSourceValidation}
            />
          </InputGroupItem>
          <InputGroupItem>
            <Button
              variant="control"
              aria-label="popover for input"
              onClick={
                () => {
                  setContentUnitSource(defaultGalaxy);
                  setContentUnitSourceValidation(ValidatedOptions.success);
                } // TODO: Global parameter
              }
            >
              <UndoIcon />
            </Button>
          </InputGroupItem>
        </InputGroup>
        {contentUnitSourceValidation === ValidatedOptions.error && (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>{`${
                unitType === 'collection' ? 'Collection' : 'Role'
              } source does not match /^https?:\\/\\/.*\\/$/!`}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>
      {unitType === 'collection' && (
        <VersionInput
          contentUnitVersions={contentUnitVersions}
          setContentUnitVersions={setContentUnitVersions}
        />
      )}
      <ActionGroup>
        <Button
          isDisabled={
            contentUnitValidation !== ValidatedOptions.success ||
            contentUnitSourceValidation !== ValidatedOptions.success
          }
          variant="primary"
          icon={<PlusIcon />}
          ouiaId="PrimaryWithIcon"
          onClick={addToBatch}
        >
          {`Add ${unitType === 'collection' ? 'Collection' : 'Role'} to batch`}{' '}
        </Button>{' '}
      </ActionGroup>
    </Form>
  );
};
