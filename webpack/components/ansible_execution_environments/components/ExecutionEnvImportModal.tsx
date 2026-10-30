import React, { ReactElement } from 'react';
import {
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  Popover,
  TextInput,
} from '@patternfly/react-core';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import styles from '@patternfly/react-styles/css/components/Form/form';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { pfValidationState } from '../../../types/common';
import { ExecutionEnvironment } from '../../../resources/clients/ExecutionEnvironment';
import { useToasts } from '../../../helpers/toasts/useToasts';

interface ExecutionEnvImportModalProps {
  onAbort: () => void;
  onImportSuccess: () => void;
}

export const ExecutionEnvImportModal = ({
  onAbort,
  onImportSuccess,
}: ExecutionEnvImportModalProps): ReactElement => {

  const { withToast } = useToasts();
  const organization = useForemanOrganization();

  const [executionEnvName, setExecutionEnvName] = React.useState<string>('');
  const [executionEnvNameValidation, setExecutionEnvNameValidation] = React.useState<
    pfValidationState
  >('default');

  const [pullUrl, setPullUrl] = React.useState<string>('');
  const [pullUrlValidation, setPullUrlValidation] = React.useState<pfValidationState>('default');
  const [pullUrlValidationHelperText, setPullUrlValidationHelperText] = React.useState<string>('');

  const [isImportLoading, setIsImportLoading] = React.useState<boolean>(
      false
  );

  const validatePullUrl = (value: string): { state: pfValidationState; value: string; helperText: string } => {
    if (value.length === 0) {
      return { state: 'error', value, helperText: _('Pull URL may not be empty.') };
    }

    if (!/^https?:\/\//.test(value)) {
      return { state: 'error', value, helperText: _('Pull URL must start with http:// or https://.') };
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return { state: 'error', value, helperText: _('Pull URL is not a valid URL.') };
    }

    const path = url.pathname || '';
    const split = path.split('/');
    const lastSegment = split.filter(n => n?.length > 0).pop() ?? '';
    const tagMatch = lastSegment.match(/[^/:]+:([^/]+)$/);

    if (!lastSegment.includes(':')) {
      return { state: 'error', value, helperText: _('Pull URL must include a tag (e.g., https://registry.example.com/library/image:latest).') };
    }

    if (!tagMatch || tagMatch[1].length === 0) {
      return { state: 'error', value, helperText: _('Pull URL must include a repository name before the tag (e.g., https://registry.example.com/library/image:latest).') };
    }

    return { state: 'success', value, helperText: '' };
  };

  const importExecutionEnvironment = async (name: string, container_image_url: string): Promise<void> => {
    setIsImportLoading(true);
    await withToast({
      type: 'create',
      resource: 'execution_environment',
      func: ExecutionEnvironment.import({
        organization_id: organization?.id,
        execution_environment: {
          name,
          container_image_url,
        },
      }),
    });
    setIsImportLoading(false);
    onImportSuccess();
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      title={_('Import an existing Execution Environment')}
      isOpen
      onClose={onAbort}
      actions={[
        <Button
          key="ok"
          variant="primary"
          onClick={() => importExecutionEnvironment(executionEnvName, pullUrl)}
          isDisabled={executionEnvNameValidation !== 'success' || pullUrlValidation !== 'success'}
          isLoading={isImportLoading}
        >
          {_('Import')}
        </Button>,
      ]}
    >
      <Form isHorizontal>
        <FormGroup label={_('Name')} isRequired>
          <TextInput
            validated={executionEnvNameValidation}
            value={executionEnvName}
            onChange={(_event, value) => {
              const valid = value.length === 0 ? 'error' as pfValidationState : 'success';
              setExecutionEnvNameValidation(valid);
              setExecutionEnvName(value);
            }}
          />
        </FormGroup>
        <FormGroup
          label={_('Image URL')}
          labelIcon={
            <Popover
              headerContent={
                _('Container image URL')
              }
              bodyContent={_(
                'Ensure this image is pullable without authentication.'
              )}
            >
              <button
                type="button"
                aria-label="More info for name field"
                onClick={e => e.preventDefault()}
                aria-describedby="simple-form-name-01"
                className={styles.formGroupLabelHelp}
              >
                <HelpIcon />
              </button>
            </Popover>
          }
          isRequired
        >
          <TextInput
            validated={pullUrlValidation}
            value={pullUrl}
            onChange={(_event, value) => {
              const v = validatePullUrl(value);
              setPullUrlValidation(v.state);
              setPullUrl(v.value);
              setPullUrlValidationHelperText(v.helperText);
            }}
          />
          {pullUrlValidation === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem>{pullUrlValidationHelperText}</HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      </Form>
    </Modal>
  );
};
