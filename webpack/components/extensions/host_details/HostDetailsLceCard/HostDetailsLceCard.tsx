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
  Skeleton,
} from '@patternfly/react-core';

import BundleIcon from '@patternfly/react-icons/dist/esm/icons/bundle-icon';

import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';

import { useForemanOrganization } from 'foremanReact/Root/Context/ForemanContext';
import { translate as _ } from 'foremanReact/common/I18n';
import { IndexResponse, useAPI } from 'foremanReact/common/hooks/API/APIHooks';

import { HostDetailsLceCardHeaderActions } from './components/HostDetailsLceCardHeaderActions';
import { LcePathSelector } from './components/LcePathSelector';
import {
  AnsibleLcePath,
  SparseAnsibleLce,
} from '../../../../types/AnsibleEnvironmentsTypes';
import { AdPermissions } from '../../../../constants/foremanAnsibleDirectorPermissions';
import { AnsibleContentSource } from '../../../../types/AnsibleContentTypes';
import { Permitted } from '../../../common/Permitted';

interface HostDetailsLceCardProps {
  status: 'RESOLVED' | 'PENDING' | 'ERROR';
  hostDetails: {
    id: number;
    name: string;
    // eslint-disable-next-line camelcase
    ansible_content_source: AnsibleContentSource | null;
  };
}
interface LcePathsResponse extends IndexResponse {
  results: AnsibleLcePath[];
}

export const HostDetailsLceCard = ({
  status,
  hostDetails,
}: HostDetailsLceCardProps): React.ReactElement | null => {
  const organization = useForemanOrganization();

  const LCE_PATH_SELECTOR_PLACEHOLDER = _('Lifecycle environment path');
  const LCE_SELECTOR_PLACEHOLDER = _('Lifecycle environment');

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

  const [initialLcePath, setInitialLcePath] = React.useState<string>(
    LCE_PATH_SELECTOR_PLACEHOLDER
  );

  const [initialLce, setInitialLce] = React.useState<string>(
    LCE_SELECTOR_PLACEHOLDER
  );

  const getLcePathsResponse = useAPI<LcePathsResponse>(
    'get',
    foremanUrl(
      `/api/v2/ansible_director/lifecycle_environments/paths?order=name&${
        organization ? `organization_id=${organization.id}&` : ''
      }`
    )
  );

  useEffect(() => {
    if (getLcePathsResponse.status === 'RESOLVED') {
      setAvailableLcePaths(getLcePathsResponse.response.results);

      if (
        selectedLcePath === LCE_PATH_SELECTOR_PLACEHOLDER &&
        getLcePathsResponse.response.results.length !== 0
      ) {
        let lcePath: string = selectedLcePath;
        let lce: string = selectedLce;

        for (let i = 0; i < getLcePathsResponse.response.results.length; i++) {
          const pathLces: SparseAnsibleLce[] =
            getLcePathsResponse.response.results[i].lifecycle_environments;
          for (let j = 0; j < pathLces.length; j++) {
            if (pathLces[j].id === hostDetails.ansible_content_source?.id) {
              lcePath = getLcePathsResponse.response.results[i].name;
              lce = pathLces[j].name;
              break;
            }
          }
          if (lcePath !== selectedLcePath) break;
        }

        setInitialLcePath(lcePath);
        setInitialLce(lce);
        setSelectedLcePath(lcePath);
        setSelectedLce(lce);
      }
    }
  }, [
    getLcePathsResponse,
    hostDetails.ansible_content_source,
    selectedLce,
    selectedLcePath,
  ]);

  const dispatch = useDispatch();

  const handleClose = (abort: boolean): void => {
    if (isEditMode) {
      if (!abort) {
        // eslint-disable-next-line no-void
        void setLce(lceForName(selectedLce).id);
        setInitialLce(selectedLce);
        setInitialLcePath(selectedLcePath);
      } else {
        setSelectedLce(initialLce);
        setSelectedLcePath(initialLcePath);
      }
      setIsEditMode(false);
      return;
    }
    setIsEditMode(true);
  };

  const handleAbort = (): void => {
    handleClose(true);
  };

  const handleEdit = (): void => {
    handleClose(false);
  };

  const lceForName = (
    name: string
  ): SparseAnsibleLce => // TODO: I know this can be done better, but I'm too lazy to deal with it right now.'
    availableLcePaths
      .filter(lcePath => lcePath.name === selectedLcePath)[0]
      .lifecycle_environments.filter(lce => lce.name === name)[0];

  const setLce = async (
    lceIdentifier: number | 'inherit' | 'none'
  ): Promise<void> => {
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible_director/lifecycle_environments/${lceIdentifier}/assign/HOST/${hostDetails.id}`
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
                  handleAbort={handleAbort}
                  handleInherit={async () => {
                    await setLce('inherit');
                    setIsEditMode(false);
                  }}
                  handleUnset={async () => {
                    await setLce('none');
                    setSelectedLce(LCE_SELECTOR_PLACEHOLDER);
                    setSelectedLcePath(LCE_PATH_SELECTOR_PLACEHOLDER);
                    setIsEditMode(false);
                  }}
                />
              ),
            }}
          >
            <Flex
              alignItems={{
                default: 'alignItemsCenter',
              }}
              justifyContent={{
                default: 'justifyContentSpaceBetween',
              }}
              style={{
                width: '100%',
              }}
            >
              <FlexItem>
                <Flex
                  alignItems={{
                    default: 'alignItemsCenter',
                  }}
                  justifyContent={{
                    default: 'justifyContentSpaceBetween',
                  }}
                >
                  <FlexItem>
                    <CardTitle>
                      {hostDetails.ansible_content_source &&
                      hostDetails.ansible_content_source.inherited ? (
                        <>
                          <BundleIcon /> {_('Ansible environment (inherited)')}
                        </>
                      ) : (
                        <>
                          <BundleIcon /> {_('Ansible environment')}
                        </>
                      )}
                    </CardTitle>
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
              <LcePathSelector
                lcePaths={availableLcePaths}
                isEditMode={isEditMode}
                selectedLcePath={selectedLcePath}
                setSelectedLcePath={setSelectedLcePath}
                selectedLce={selectedLce}
                setSelectedLce={setSelectedLce}
              />
            </Permitted>
          </CardBody>
        </Card>
      </GridItem>
    );
  }

  if (status === 'ERROR') {
    return null; // TODO: Handle request error
  }

  return (
    <>
      <Skeleton screenreaderText={_('Loading lifecycle environment path')} />
      <br />
      <Skeleton screenreaderText={_('Loading lifecycle environment')} />
    </>
  );
};
