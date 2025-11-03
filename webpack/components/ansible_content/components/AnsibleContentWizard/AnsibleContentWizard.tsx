import React, { Dispatch, SetStateAction } from 'react';
import {
  Modal,
  ModalVariant,
  Wizard,
  WizardHeader,
  WizardStep,
  Badge,
  TextVariants,
  TextContent,
  Text,
} from '@patternfly/react-core';
import { AnsibleContentUnitCreate } from '../../../../types/AnsibleContentTypes';
import { ReviewStep } from './components/ReviewStep';
import ProviderSelectionStep from './components/ProviderSelectionStep';
import FinishFooter from './components/components/FinishFooter';
import { ContentUnitInput } from './components/components/ContentUnitInput';
import { DefaultFooter } from './components/components/DefaultFooter';
import { YamlEditor } from '../../../common/YamlEditor';

interface AnsibleContentWizardProps {
  isContentWizardOpen: boolean;
  setIsContentWizardOpen: Dispatch<SetStateAction<boolean>>;
  refreshRequest: () => void;
}

const AnsibleContentWizard: React.FC<AnsibleContentWizardProps> = ({
  isContentWizardOpen,
  setIsContentWizardOpen,
  refreshRequest,
}) => {
  const [contentUnits, setContentUnits] = React.useState<
    Array<AnsibleContentUnitCreate>
  >([]);
  const [yamlFile, setYamlFile] = React.useState<string>('');

  const [provider, setProvider] = React.useState<'galaxy' | 'yaml' | undefined>(
    undefined
  );

  const resetWizard = (): void => {
    setContentUnits([]);
    setYamlFile('');
    setProvider(undefined);
  };

  const wizardSteps = (): React.ReactNode => {
    switch (provider) {
      case 'galaxy':
        return [
          [
            <WizardStep
              name="Content Declaration"
              id="declarationStep"
              footer={
                <DefaultFooter
                  isBackDisabled={false}
                  isNextDisabled={contentUnits.length < 1}
                />
              }
            >
              <>
                <TextContent>
                  {' '}
                  <Text component={TextVariants.h2}>
                    Declare content to import
                  </Text>
                </TextContent>
                <ContentUnitInput
                  contentUnits={contentUnits}
                  setContentUnits={setContentUnits}
                />
              </>
            </WizardStep>,
            <WizardStep
              name={
                contentUnits.length > 0 ? (
                  <>
                    Review <Badge key={1}>{contentUnits.length}</Badge>
                  </>
                ) : (
                  'Review'
                )
              }
              id="reviewStep"
              footer={
                <FinishFooter
                  isFinishDisabled={contentUnits.length < 1}
                  provider="galaxy"
                  contentUnits={contentUnits}
                  yamlFile={yamlFile}
                  setIsContentWizardOpen={setIsContentWizardOpen}
                  refreshRequest={refreshRequest}
                  resetWizard={resetWizard}
                />
              }
            >
              <>
                <TextContent>
                  {' '}
                  <Text component={TextVariants.h2}>
                    Review content before importing
                  </Text>
                </TextContent>
                <ReviewStep
                  contentUnits={contentUnits}
                  setContentUnits={setContentUnits}
                />
              </>
            </WizardStep>,
          ],
        ];
      case 'yaml':
        return (
          <WizardStep
            name="Content Declaration"
            id="declarationStep"
            footer={
              <FinishFooter
                isFinishDisabled={yamlFile === ''}
                provider="yaml"
                contentUnits={contentUnits}
                yamlFile={yamlFile}
                setIsContentWizardOpen={setIsContentWizardOpen}
                refreshRequest={refreshRequest}
                resetWizard={resetWizard}
              />
            }
          >
            <>
              <TextContent>
                {' '}
                <Text component={TextVariants.h2}>
                  Declare Ansible content using a requirements file
                </Text>
              </TextContent>
              <YamlEditor yamlFile={yamlFile} setYamlFile={setYamlFile} />
            </>
          </WizardStep>
        );

      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <Modal
        variant={ModalVariant.large}
        showClose={false}
        isOpen={isContentWizardOpen}
        aria-labelledby="modal-wizard-label"
        aria-describedby="modal-wizard-description"
        hasNoBodyWrapper
        width="60%"
        disableFocusTrap
      >
        <Wizard
          startIndex={1}
          header={
            <WizardHeader
              title="Import Ansible content"
              titleId="modal-wizard-label"
              onClose={() => {
                setIsContentWizardOpen(false);
                resetWizard();
              }}
              closeButtonAriaLabel="Close wizard"
            />
          }
          onClose={() => {
            setIsContentWizardOpen(false);
            resetWizard();
          }}
        >
          <WizardStep
            name="Provider Selection"
            id="provider-selection-step"
            footer={
              <DefaultFooter
                isBackDisabled
                isNextDisabled={provider === undefined}
              />
            }
          >
            <>
              <TextContent>
                {' '}
                <Text component={TextVariants.h2}>
                  Select source of Ansible content
                </Text>
              </TextContent>
              <ProviderSelectionStep
                provider={provider}
                setProvider={setProvider}
              />
            </>
          </WizardStep>
          {wizardSteps()}
        </Wizard>
      </Modal>
    </React.Fragment>
  );
};

export default AnsibleContentWizard;
