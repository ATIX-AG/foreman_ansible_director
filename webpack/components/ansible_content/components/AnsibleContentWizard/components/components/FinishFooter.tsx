import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { WizardFooter, useWizardContext } from '@patternfly/react-core';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useDispatch } from 'react-redux';
import { addToast } from 'foremanReact/components/ToastsList';
import { AnsibleContentUnitCreate } from '../../../../../../types/AnsibleContentTypes';

interface FinishFooterProps {
  isFinishDisabled: boolean;
  provider: 'galaxy' | 'yaml';
  contentUnits: AnsibleContentUnitCreate[];
  yamlFile: string;
  setIsContentWizardOpen: Dispatch<SetStateAction<boolean>>;
  refreshRequest: () => void;
  resetWizard: () => void;
}

const FinishFooter: React.FC<FinishFooterProps> = ({
  isFinishDisabled,
  provider,
  contentUnits,
  yamlFile,
  setIsContentWizardOpen,
  refreshRequest,
  resetWizard,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const organization = useForemanOrganization();
  const dispatch = useDispatch();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (provider === 'yaml') {
        await axios.post(
          foremanUrl('/api/v2/ansible_director/ansible_content/from_yaml'),
          {
            requirements_file: btoa(encodeURIComponent(yamlFile)),
          }
        );
        dispatch(
          addToast({
            type: 'success',
            key: `IMPORT_CU_${contentUnits.length}_SUCC`,
            message:
              'Sucessfully imported Ansible content units from YAML file"!',
            sticky: false,
          })
        );
      } else if (provider === 'galaxy') {
        await axios.post(
          foremanUrl('/api/v2/ansible_director/ansible_content'),
          {
            organization_id: organization?.id,
            units: contentUnits.map(unit => ({
              unit_name: unit.identifier,
              unit_type: unit.type,
              unit_source: unit.source,
              unit_versions: unit.versions.map(
                versionObj => versionObj.version
              ),
            })),
          }
        );
        dispatch(
          addToast({
            type: 'success',
            key: `IMPORT_CU_${contentUnits.length}_SUCC`,
            message: `Sucessfully imported ${
              contentUnits.length
            } Ansible content ${
              contentUnits.length === 1 ? 'unit' : 'units'
            }"!`,
            sticky: false,
          })
        );
      }
    } catch (err) {
      dispatch(
        addToast({
          type: 'danger',
          key: `IMPORT_CU_${contentUnits.length}_ERR`,
          message: `Importing of ${
            contentUnits.length
          } Ansible content units failed with error code "${
            (err as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    } finally {
      setLoading(false);
      setIsContentWizardOpen(false);
      refreshRequest();
      resetWizard();
    }
  }, [
    contentUnits,
    dispatch,
    organization,
    provider,
    refreshRequest,
    setIsContentWizardOpen,
    yamlFile,
    resetWizard,
  ]);

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
