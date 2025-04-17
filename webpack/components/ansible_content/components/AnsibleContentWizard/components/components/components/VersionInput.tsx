import React, { Dispatch, FormEvent, SetStateAction } from 'react';
import {
  Button,
  Chip,
  ChipGroup,
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
import PlusIcon from '@patternfly/react-icons/dist/esm/icons/plus-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

interface VersionInputProps {
  contentUnitVersions: Array<string>;
  setContentUnitVersions: Dispatch<SetStateAction<Array<string>>>;
}
export const VersionInput: React.FC<VersionInputProps> = ({
  contentUnitVersions,
  setContentUnitVersions,
}) => {
  const [versionInput, setVersionInput] = React.useState<string>('');
  const [versionInputValidation, setVersionInputValidation] = React.useState<
    ValidatedOptions
  >(ValidatedOptions.default);

  const handleVersionAdd = (): void => {
    const versions: Array<string> = versionInput
      .split(',')
      .map(version => version.trim());
    setContentUnitVersions(oldVersions => [...oldVersions, ...versions]);
    setVersionInput('');
  };

  const handleVersionInput = (
    _event: FormEvent<HTMLInputElement>,
    value: string
  ): void => {
    let validationState = ValidatedOptions.success;

    if (!new RegExp('^(\\d+(\\.\\d+)*)(,\\s?(\\d+(\\.\\d+)*))*$').test(value)) {
      validationState = ValidatedOptions.error;
    }

    setVersionInputValidation(validationState);
    setVersionInput(value);
  };

  return (
    <FormGroup
      label="Collection versions"
      labelIcon={
        <Popover
          headerContent={<div>A subset of versions to import.</div>}
          bodyContent={
            <div>
              If left empty, all available versions will be imported. Versions
              are not checked for validity. Invalid versions will cause failure
              of the importer.
            </div>
          }
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
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            validated={versionInputValidation}
            value={versionInput}
            onChange={handleVersionInput}
            onKeyDown={event =>
              event.key === 'Enter' &&
              versionInputValidation === ValidatedOptions.success
                ? handleVersionAdd()
                : null
            }
            id="cu-source-input-01"
            type="text"
            aria-label="content unit source input"
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button variant="control" onClick={handleVersionAdd}>
            <PlusIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
      {versionInputValidation === ValidatedOptions.error && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              {
                'Version list does not conform to the pattern: "<version>, <version>"'
              }
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
      <ChipGroup categoryName="Only import: " numChips={10}>
        {contentUnitVersions.map(unitVersion => (
          <Chip
            key={unitVersion}
            onClick={() =>
              setContentUnitVersions(oldVersions =>
                oldVersions.filter(v => v !== unitVersion)
              )
            }
          >
            {unitVersion}
          </Chip>
        ))}
      </ChipGroup>
    </FormGroup>
  );
};
