import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { WizardFooter, useWizardContext } from '@patternfly/react-core';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { translate as _ } from 'foremanReact/common/I18n';
import {
  AnsibleContentUnitCreateType,
  isAnsibleGalaxyContentUnitCreate,
} from '../../AnsibleContentWizard';
import { useToasts } from '../../../../../../helpers/toasts/useToasts';
import { AnsibleContent } from '../../../../../../resources/clients/AnsibleContent';

interface FinishFooterProps {
  isFinishDisabled: boolean;
  provider: 'galaxy' | 'yaml';
  contentUnits: AnsibleContentUnitCreateType[];
  yamlFile: string;
  setIsContentWizardOpen: Dispatch<SetStateAction<boolean>>;
  resetWizard: () => void;
}

const FinishFooter: React.FC<FinishFooterProps> = ({
  isFinishDisabled,
  provider,
  contentUnits,
  yamlFile,
  setIsContentWizardOpen,
  resetWizard,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { withToast } = useToasts();
  const organization = useForemanOrganization();

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (provider === 'galaxy') {

      await withToast({
        type: 'task',
        func: AnsibleContent.create({
          organization_id: organization?.id,
          units: contentUnits.map(unit => {
            if (isAnsibleGalaxyContentUnitCreate(unit)) {
              return {
                unit_name: unit.identifier,
                unit_type: unit.type,
                unit_source_type: 'galaxy',
                unit_source: unit.source,
                unit_versions: unit.versions.map(
                  versionObj => versionObj.version
                ),
              };
            } else { // if (isAnsibleGitContentUnitCreate(unit))
              return {
                unit_name: unit.identifier,
                unit_type: unit.type,
                unit_source_type: 'git',
                unit_source: unit.gitUrl,
                unit_versions: unit.gitRefs,
              };
            }
          }),
        }),
      });
      setLoading(false);
      setIsContentWizardOpen(false);
      resetWizard();
    }
  }, [provider, withToast, organization?.id, contentUnits, setIsContentWizardOpen, resetWizard]);

  const { activeStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooter
      isNextDisabled={isFinishDisabled}
      nextButtonText={_('Finish')}
      activeStep={activeStep}
      nextButtonProps={{
        spinnerAriaValueText: 'Loading',
        spinnerAriaLabelledBy: 'primary-loading-button',
        isLoading: loading,
      }}
      onNext={fetchData}
      onBack={goToPrevStep}
      onClose={close}
    />
  );
};
export default FinishFooter;
