import React from 'react';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  GridItem,
} from '@patternfly/react-core';
import CatalogIcon from '@patternfly/react-icons/dist/esm/icons/catalog-icon';

import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';

import Permitted from 'foremanReact/components/Permitted';
import { translate as _ } from 'foremanReact/common/I18n';

import { HostDetailsLceCardHeaderActions } from './components/HostDetailsLceCardHeaderActions';
import { LcePathSelectorWrapper } from './components/LcePathSelectorWrapper';
import {
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';

interface HostDetailsLceCardProps {
  status: 'RESOLVED' | 'PENDING' | 'ERROR';
  hostDetails: {
    id: number;
    name: string;
    // eslint-disable-next-line camelcase
    ansible_lifecycle_environment_id: number | null;
  };
}

export const HostDetailsLceCard = ({
  status,
  hostDetails,
}: HostDetailsLceCardProps): React.ReactElement | null => {
  const LCE_PATH_SELECTOR_PLACEHOLDER = 'Lifecycle environment path';
  const LCE_SELECTOR_PLACEHOLDER = 'Lifecycle environment';

  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);

  const [availableLcePaths, setAvailableLcePaths] = React.useState<
    AnsibleLcePath[]
  >([]);

  const [selectedLcePath, setSelectedLcePath] = React.useState<string>(
    LCE_PATH_SELECTOR_PLACEHOLDER
  );

  const [selectedLce, setSelectedLce] = React.useState<string>(
    LCE_SELECTOR_PLACEHOLDER
  );

  const [isUsingLibrary, setIsUsingLibrary] = React.useState(
    hostDetails.ansible_lifecycle_environment_id === null
  );

  const dispatch = useDispatch();

  const handleEdit = (): void => {
    if (isEditMode) {
      // eslint-disable-next-line no-void
      void setLce();
    }
    setIsEditMode(!isEditMode);
  };

  const lceForName = (
    name: string
  ): SparseAnsibleLce => // TODO: I know this can be done better, but I'm too lazy to deal with it right now.'
    availableLcePaths
      .filter(lcePath => lcePath.name === selectedLcePath)[0]
      .lifecycle_environments.filter(lce => lce.name === name)[0];

  const setLce = async (library = false): Promise<void> => {
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible_director/lifecycle_environments/${
            library ? 'library' : lceForName(selectedLce).id
          }/assign/HOST/${hostDetails.id}`
        ),
        {}
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_HOST_${hostDetails.id}_ANSIBLE_LCE_SUCC`,
          message: `Successfully updated Ansible content source of "${hostDetails.name}"!`,
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_HOST_${hostDetails.id}_ANSIBLE_LCE_ERR`,
          message: `Updating Ansible content source of "${
            hostDetails.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  const handleContentSourceSet = async (): Promise<void> => {
    if (!isUsingLibrary) {
      await setLce(true);
    }
    setIsUsingLibrary(!isUsingLibrary);
  };

  if (status === 'RESOLVED') {
    return (
      <GridItem rowSpan={1} md={6} lg={4} xl2={3}>
        <Card ouiaId="host-collections-card">
          <CardHeader
            actions={{
              actions: (
                <HostDetailsLceCardHeaderActions
                  isEditMode={isEditMode}
                  handleEdit={handleEdit}
                  isUsingLibrary={isUsingLibrary}
                  handleContentSourceSet={handleContentSourceSet}
                />
              ),
            }}
          >
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              style={{ width: '100%' }}
            >
              <FlexItem>
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                >
                  <FlexItem>
                    <CardTitle>{_('Ansible environment')}</CardTitle>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardHeader>
          <CardBody>
            <Permitted
              requiredPermissions={[
                AdPermissions.ansibleLce.view,
                AdPermissions.ansibleLcePaths.view,
              ]}
            >
              {!isUsingLibrary ? (
                <LcePathSelectorWrapper
                  isEditMode={isEditMode}
                  selectedLcePath={selectedLcePath}
                  setSelectedLcePath={setSelectedLcePath}
                  selectedLce={selectedLce}
                  setSelectedLce={setSelectedLce}
                  availableLcePaths={availableLcePaths}
                  setAvailableLcePaths={setAvailableLcePaths}
                  hostDetails={hostDetails}
                />
              ) : (
                <EmptyState variant={EmptyStateVariant.xs}>
                  <EmptyStateHeader
                    headingLevel="h4"
                    titleText={_(
                      'This host uses Ansible content from the Library environment.'
                    )}
                    icon={<EmptyStateIcon icon={CatalogIcon} />}
                  />
                </EmptyState>
              )}
            </Permitted>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  if (status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return null;
};
