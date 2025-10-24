import React, { ReactElement } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { useDispatch } from 'react-redux';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';
import {
  AnsibleVariableDetail,
  AnsibleVariableOverride,
  AnsibleVariableOverrideCreate,
} from '../../../../../types/AnsibleVariableTypes';

import { OverrideCard } from './OverrideCard';
import { OverrideManagementModal } from './OverrideManagementModal';

interface OverridesTabContentProps {
  variable: AnsibleVariableDetail;
  refreshRequest: () => void;
}

export const OverridesTabContent = ({
  variable,
  refreshRequest,
}: OverridesTabContentProps): ReactElement => {
  const [selectedOverride, setSelectedOverride] = React.useState<
    AnsibleVariableOverride | AnsibleVariableOverrideCreate | undefined
  >(undefined);

  const [overrideMatcher, setOverrideMatcher] = React.useState<
    AnsibleVariableOverride['matcher']
  >('fqdn');
  const [overrideValue, setOverrideValue] = React.useState<
    string | boolean | number
  >('');
  const [overrideMatcherValue, setOverrideMatcherValue] = React.useState<
    string
  >('');

  const dispatch = useDispatch();

  const isAnsibleVariableOverride = (
    override: AnsibleVariableOverride | AnsibleVariableOverrideCreate
  ): override is AnsibleVariableOverride => 'id' in override;

  const handleOverrideSave = async (): Promise<void> => {
    if (selectedOverride !== undefined) {
      if (isAnsibleVariableOverride(selectedOverride)) {
        try {
          await axios.put(
            foremanUrl(
              `/api/v2/ansible/ansible_variables/${variable.id}/overrides/${selectedOverride.id}`
            ),
            {
              override: {
                value: overrideValue,
                matcher: overrideMatcher,
                matcher_value: overrideMatcherValue,
              },
            }
          );
          addToast({
            type: 'success',
            key: `EDIT_OVERRIDE_${selectedOverride.id}_SUCC`,
            message: `Successfully created override for "${variable.name}"!`,
            sticky: false,
          });
          refreshRequest();
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `UPDATE_OVERRIDE_${selectedOverride.id}_ERR`,
              message: `Updating of Ansible variable override "${
                selectedOverride.id
              }" failed with error code "${
                (e as { response: AxiosResponse }).response.status
              }".`,
              sticky: false,
            })
          );
        }
      } else {
        try {
          await axios.post(
            foremanUrl(
              `/api/v2/ansible/ansible_variables/${variable.id}/overrides/`
            ),
            {
              override: {
                value: overrideValue,
                matcher: overrideMatcher,
                matcher_value: overrideMatcherValue,
              },
            }
          );
          dispatch(
            addToast({
              type: 'success',
              key: `CREATE_OVERRIDE_FOR_${variable.id}_SUCC`,
              message: `Successfully created override for "${variable.name}"!`,
              sticky: false,
            })
          );
          refreshRequest();
        } catch (e) {
          dispatch(
            addToast({
              type: 'danger',
              key: `CREATE_OVERRIDE_${variable.id}_ERR`,
              message: `Creation of Ansible variable override for variable"${
                variable.name
              }" failed with error code "${
                (e as { response: AxiosResponse }).response.status
              }".`,
              sticky: false,
            })
          );
        }
        setSelectedOverride(undefined);
      }
    }
  };

  const initializeOverrideCreate = (): void => {
    const newOverride: AnsibleVariableOverrideCreate = {
      value: '',
      matcher: 'fqdn',
      matcher_value: '',
    };
    setSelectedOverride(newOverride);
  };

  const gridItems = (): ReactElement[] => {
    const items: ReactElement[] = [];

    variable.overrides.forEach(override => {
      items.push(
        <GridItem span={3}>
          <OverrideCard
            override={override}
            variable={variable}
            onClick={() => {
              setSelectedOverride(override);
            }}
          />
        </GridItem>
      );
    });

    return items;
  };

  return (
    <>
      {variable.overrides.length > 0 ? (
        <>
          <Grid hasGutter style={{ paddingTop: '20px' }}>
            {gridItems()}
          </Grid>
        </>
      ) : (
        <EmptyState>
          <EmptyStateHeader
            titleText="Variable does not have any overrides defined."
            headingLevel="h4"
            icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
          />
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button
                variant="primary"
                onClick={() => {
                  initializeOverrideCreate();
                }}
              >
                Create override
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      )}
      {selectedOverride !== undefined && (
        <OverrideManagementModal
          variable={variable}
          override={selectedOverride}
          onSave={handleOverrideSave}
          setSelectedOverride={setSelectedOverride}
          setOverrideMatcher={setOverrideMatcher}
          setOverrideValue={setOverrideValue}
          setOverrideMatcherValue={setOverrideMatcherValue}
          overrideMatcher={overrideMatcher}
          overrideValue={overrideValue}
          overrideMatcherValue={overrideMatcherValue}
        />
      )}
    </>
  );
};
