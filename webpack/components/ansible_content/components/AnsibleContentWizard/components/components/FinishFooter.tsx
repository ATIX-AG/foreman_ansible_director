import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { WizardFooter, useWizardContext } from '@patternfly/react-core';
import { AnsibleContentUnitCreate } from '../../../../../../types/AnsibleContentTypes';

interface FinishFooterProps {
  isFinishDisabled: boolean;
  provider: 'galaxy' | 'yaml';
  contentUnits: AnsibleContentUnitCreate[];
  yamlFile: string;
}

const FinishFooter: React.FC<FinishFooterProps> = ({
  isFinishDisabled,
  provider,
  contentUnits,
  yamlFile,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (provider === 'yaml') {
        await axios.post(
          foremanUrl('/api/v2/ansible/ansible_content/from_yaml'),
          {
            requirements_file: btoa(encodeURIComponent(yamlFile)),
          }
        );
      } else if (provider === 'galaxy') {
        await axios.post(foremanUrl('/api/v2/ansible/ansible_content'), {
          units: contentUnits.map(unit => ({
            unit_name: unit.identifier,
            unit_type: unit.type,
            unit_source: unit.source,
            unit_versions: unit.versions.map(versionObj => versionObj.version),
          })),
        });
      }
    } catch (err) {
      // TODO: Error Popup
    } finally {
      setLoading(false);
    }
  }, [contentUnits, provider, yamlFile]);

  const { activeStep, goToPrevStep, close } = useWizardContext();
  return (
    <WizardFooter
      isNextDisabled={isFinishDisabled}
      nextButtonText="Finish"
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
