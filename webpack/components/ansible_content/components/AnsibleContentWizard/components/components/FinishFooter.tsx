import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { WizardFooter, useWizardContext } from '@patternfly/react-core';
import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { useDispatch } from 'react-redux';
import { addToast } from 'foremanReact/components/ToastsList';
import { translate as _, sprintf as __ } from 'foremanReact/common/I18n';
import {
  AnsibleContentUnitCreateType,
  isAnsibleGalaxyContentUnitCreate,
  isAnsibleGitContentUnitCreate,
} from '../../AnsibleContentWizard';
import { DefaultResponse, Task } from '../../../../../../types/common';

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
              'Successfully imported Ansible content units from YAML file!',
            sticky: false,
          })
        );
      } else if (provider === 'galaxy') {
        const triggeredTask: AxiosResponse<DefaultResponse<
          never,
          never,
          { task: Task }
        >> = await axios.post(
          foremanUrl('/api/v2/ansible_director/ansible_content'),
          {
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
              } else if (isAnsibleGitContentUnitCreate(unit)) {
                return {
                  unit_name: unit.identifier,
                  unit_type: unit.type,
                  unit_source_type: 'git',
                  unit_source: unit.gitUrl,
                  unit_versions: unit.gitRefs,
                };
              }

              return null; // Never happens, but I want to use the type-guard to make TSC shut it
            }),
          }
        );
        dispatch(
          addToast({
            type: 'success',
            key: `IMPORT_CU_${contentUnits.length}_SUCC`,
            message: (
              <span>
                {__(
                  _(
                    'A task to import %(count)s Ansible content unit%(plural)s was started successfully!'
                  ),
                  {
                    count: contentUnits.length,
                    plural: contentUnits.length === 1 ? '' : 's',
                  }
                )}
                <br />
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={foremanUrl(
                    `/foreman_tasks/tasks/${triggeredTask.data.results.task.id}`
                  )}
                >
                  {_('View the task page for more details.')}
                </a>
              </span>
            ),

            sticky: false,
          })
        );
      }
    } catch (err) {
      dispatch(
        addToast({
          type: 'danger',
          key: `IMPORT_CU_${contentUnits.length}_ERR`,
          message: __(
            _(
              'Starting of task to import %(count)s Ansible content unit%(plural)s failed with error code "%(error)s".'
            ),
            {
              count: contentUnits.length,
              plural: contentUnits.length === 1 ? '' : 's',
              error: (err as { response: AxiosResponse }).response.status,
            }
          ),
          sticky: false,
        })
      );
    } finally {
      setLoading(false);
      setIsContentWizardOpen(false);
      resetWizard();
    }
  }, [
    contentUnits,
    dispatch,
    organization,
    provider,
    setIsContentWizardOpen,
    yamlFile,
    resetWizard,
  ]);

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
