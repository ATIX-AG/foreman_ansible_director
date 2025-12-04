import React, { ReactElement } from 'react';
import axios, { AxiosResponse } from 'axios';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateHeader,
  Icon,
} from '@patternfly/react-core';

import { foremanUrl } from 'foremanReact/common/helpers';
import { useDispatch } from 'react-redux';
import { addToast } from 'foremanReact/components/ToastsList';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';
import SaveIcon from '@patternfly/react-icons/dist/esm/icons/save-icon';
import { LceAssignmentSelector } from './LceAssignmentSelector';
import {
  AvailableContentResponse,
  isAnsibleLce,
  unnamedAssignmentType,
} from './AssignmentComponentWrapper';
import { AdPermissions } from '../../../../../constants/foremanAnsibleDirectorPermissions';

interface AssignmentComponentProps {
  contentResponse: AvailableContentResponse;
  assignedContent: unnamedAssignmentType;
  hostId: number;
}

export const AssignmentComponent = ({
  contentResponse,
  assignedContent,
  hostId,
}: AssignmentComponentProps): ReactElement => {
  const [isSaveLoading, setIsSaveLoading] = React.useState<boolean>(false);
  const [chosenUnits, setChosenUnits] = React.useState<{
    [unit: string]: { type: string; id: number }[];
  }>({});

  const dispatch = useDispatch();

  const userCanManageAssignments: boolean = usePermissions([
    AdPermissions.assignments.create,
    AdPermissions.assignments.destroy,
  ]);

  const bulkAssignContent = async (): Promise<void> => {
    const formattedUnits: {
      source: {
        type: 'ACR' | 'AR';
        id: number;
      };
      target: {
        type: 'HOST';
        id: number;
      };
    }[] = [];

    Object.keys(chosenUnits).forEach(unitKey => {
      const units = chosenUnits[unitKey];

      units.forEach(unit => {
        formattedUnits.push({
          source: {
            type: unit.type === 'collection' ? 'ACR' : 'AR',
            id: unit.id,
          },
          target: {
            type: 'HOST',
            id: hostId,
          },
        });
      });
    });

    try {
      await axios.post(
        foremanUrl('/api/v2/ansible_director/assignments/bulk'),
        {
          assignments: formattedUnits,
        }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `UPDATE_HOST_${hostId}_ANSIBLE_CONTENT_SUCC`,
          message: 'Successfully updated Ansible content assignments!',
          sticky: false,
        })
      );
      // refreshRequest();
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `UPDATE_HOST_${hostId}_ANSIBLE_CONTENT_ERR`,
          message: `Updating of Ansible content assignments failed with error code "${
            (e as { response: AxiosResponse }).response.status
          }".`,
          sticky: false,
        })
      );
    }
  };

  return (
    <>
      <Card ouiaId="BasicCard" isLarge>
        <CardHeader
          actions={{
            actions: (
              <>
                <Button
                  variant="plain"
                  aria-label="Action"
                  onClick={async () => {
                    setIsSaveLoading(true);
                    await bulkAssignContent();
                    setIsSaveLoading(false);
                  }}
                  isLoading={isSaveLoading}
                  isDisabled={!userCanManageAssignments}
                >
                  <Icon size="lg">
                    <SaveIcon />
                  </Icon>
                </Button>
              </>
            ),
          }}
        />
        <CardTitle>Using content from Lifecycle Environment</CardTitle>
        <CardBody>
          {isAnsibleLce(contentResponse) ? (
            <LceAssignmentSelector
              assignedContent={assignedContent}
              contentUnits={contentResponse.content}
              chosenUnits={chosenUnits}
              setChosenUnits={setChosenUnits}
              userCanManageAssignments={userCanManageAssignments}
            />
          ) : (
            <EmptyState>
              <EmptyStateHeader
                titleText="As of now, only content from Lifecycle Environments can be assigned to hosts."
                headingLevel="h4"
              />
            </EmptyState>
          )}
        </CardBody>
      </Card>
    </>
  );
};
