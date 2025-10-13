import React, { useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import { useDispatch } from 'react-redux';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  GridItem,
} from '@patternfly/react-core';

import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';

import EmptyPage from 'foremanReact/routes/common/EmptyPage';
import { HostDetailsLceCardHeaderActions } from './components/HostDetailsLceCardHeaderActions';
import { LcePathSelectorWrapper } from './components/LcePathSelectorWrapper';
import {
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';

interface HostDetailsLceCardProps {
  status: 'RESOLVED' | 'PENDING' | 'ERROR';
  hostDetails: {
    id: number;
    name: string;
    // eslint-disable-next-line camelcase
    ansible_lifecycle_environment_id: number;
  };
}

export const HostDetailsLceCard = ({
  status,
  hostDetails,
}: HostDetailsLceCardProps): React.ReactElement | null => {
  const LCE_PATH_SELECTOR_PLACEHOLDER = 'Select an LCE Path';
  const LCE_SELECTOR_PLACEHOLDER = 'Select an LCE';

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

  const dispatch = useDispatch();

  useEffect(() => {
    let lcePath: string = LCE_PATH_SELECTOR_PLACEHOLDER;
    let lce: string = LCE_SELECTOR_PLACEHOLDER;
    if (availableLcePaths.length !== 0) {
      for (let i = 0; i < availableLcePaths.length; i++) {
        const pathLces: SparseAnsibleLce[] =
          availableLcePaths[i].lifecycle_environments;
        for (let j = 0; j < pathLces.length; j++) {
          if (pathLces[j].id === hostDetails.ansible_lifecycle_environment_id) {
            lcePath = availableLcePaths[i].name;
            lce = pathLces[j].name;
          }
        }
      }
    }
    setSelectedLcePath(lcePath);
    setSelectedLce(lce);
  }, [availableLcePaths, hostDetails.ansible_lifecycle_environment_id]);

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

  const setLce = async (): Promise<void> => {
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible/lifecycle_environments/${
            lceForName(selectedLce).id
          }/assign/HOST/${hostDetails.id}`
        ),
        {}
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_HOST_${hostDetails.id}_ANSIBLE_LCE_SUCC`,
          message: `Sucessfully updated Ansible lifecycle environment of "${hostDetails.name}"!`,
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_HOST_${hostDetails.id}_ANSIBLE_LCE_ERR`,
          message: `Updating Ansible lifecycle environment of "${
            hostDetails.name
          }" failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
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
                    <CardTitle>Ansible Lifecycle environment</CardTitle>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardHeader>
          <CardBody>
            <LcePathSelectorWrapper
              isEditMode={isEditMode}
              selectedLcePath={selectedLcePath}
              setSelectedLcePath={setSelectedLcePath}
              selectedLce={selectedLce}
              setSelectedLce={setSelectedLce}
              availableLcePaths={availableLcePaths}
              setAvailableLcePaths={setAvailableLcePaths}
            />
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  if (status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <EmptyPage
      message={{
        type: 'loading',
        text: 'Loading Lifecycle Environment...',
      }}
    />
  );
};
