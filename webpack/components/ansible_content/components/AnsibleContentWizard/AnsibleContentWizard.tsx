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

import { translate as _ } from 'foremanReact/common/I18n';

import {
  AnsibleGalaxyContentUnitCreate,
  AnsibleGitContentUnitCreate,
} from '../../../../types/AnsibleContentTypes';
import { ReviewStep } from './components/ReviewStep';
import ProviderSelectionStep from './components/ProviderSelectionStep';
import FinishFooter from './components/components/FinishFooter';
import { GalaxyContentUnitInput } from './components/components/GalaxyContentUnitInput';
import { DefaultFooter } from './components/components/DefaultFooter';
import { YamlEditor } from '../../../common/YamlEditor';
import { GitContentUnitInput } from './components/components/GitContentUnitInput';

interface AnsibleContentWizardProps {
  isContentWizardOpen: boolean;
  setIsContentWizardOpen: Dispatch<SetStateAction<boolean>>;
  refreshRequest: () => void;
}

export type AnsibleContentUnitCreateType =
  | AnsibleGalaxyContentUnitCreate
  | AnsibleGitContentUnitCreate;

export const isAnsibleGalaxyContentUnitCreate = (
  cuCreate: AnsibleContentUnitCreateType
): cuCreate is AnsibleGalaxyContentUnitCreate => 'versions' in cuCreate;

export const isAnsibleGitContentUnitCreate = (
  cuCreate: AnsibleContentUnitCreateType
): cuCreate is AnsibleGitContentUnitCreate => 'gitUrl' in cuCreate;

export const contentUnitCreateType = (
  contentUnitCreate: AnsibleContentUnitCreateType
): 'galaxy' | 'git' | null => {
  if (isAnsibleGalaxyContentUnitCreate(contentUnitCreate)) {
    return 'galaxy';
  } else if (isAnsibleGitContentUnitCreate(contentUnitCreate)) {
    return 'git';
  }

  return null;
};

const AnsibleContentWizard: React.FC<AnsibleContentWizardProps> = ({
  isContentWizardOpen,
  setIsContentWizardOpen,
  refreshRequest,
}) => {
  const [contentUnits, setContentUnits] = React.useState<
    Array<AnsibleContentUnitCreateType>
  >([]);
  const [yamlFile, setYamlFile] = React.useState<string>('');

  const [provider, setProvider] = React.useState<
    'galaxy' | 'git' | 'yaml' | undefined
  >(undefined);

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
              name={_('Content')}
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
                    {_('Specify content to import')}
                  </Text>
                </TextContent>
                <GalaxyContentUnitInput
                  contentUnits={contentUnits}
                  setContentUnits={setContentUnits}
                />
              </>
            </WizardStep>,
            <WizardStep
              name={
                contentUnits.length > 0 ? (
                  <>
                    {_('Review')} <Badge key={1}>{contentUnits.length}</Badge>
                  </>
                ) : (
                  _('Review')
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
                    {_('Review content before importing')}
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
      case 'git':
        return [
          [
            <WizardStep
              name={_('Content')}
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
                    {_('Import content from Git repository')}
                  </Text>
                </TextContent>
                <GitContentUnitInput
                  contentUnits={contentUnits}
                  setContentUnits={setContentUnits}
                />
              </>
            </WizardStep>,
            <WizardStep
              name={
                contentUnits.length > 0 ? (
                  <>
                    {_('Review')} <Badge key={1}>{contentUnits.length}</Badge>
                  </>
                ) : (
                  _('Review')
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
                    {_('Review content before importing')}
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
            name={_('Content')}
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
                  {_('Import Ansible content using a requirements file')}
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
              title={_('Import Ansible content')}
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
            name={_('Source')}
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
                  {_('Select source of Ansible content')}
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
