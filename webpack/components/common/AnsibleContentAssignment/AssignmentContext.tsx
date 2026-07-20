import React, { ReactNode, createContext, ReactElement } from 'react';
import axios, { AxiosResponse } from 'axios';
import { foremanUrl } from 'foremanReact/common/helpers';
import { addToast } from 'foremanReact/components/ToastsList';
import { sprintf as __, translate as _ } from 'foremanReact/common/I18n';
import { useDispatch } from 'react-redux';
import {
  AnsibleContentAssignment, AnsibleContentAssignmentCreate,
  ContentResolutionNode,
  ContentResolutionNodeType,
  ResolvedAssignment,
} from '../../../types/AnsibleContentAssignmentTypes';
import { useLegacySelectValue } from '../../../helpers/hooks/useLegacySelectValue';
import { DefaultResponse } from '../../../types/common';
import { AnsibleDirectorError } from '../../../types/issues/errors';
import { ResolutionWarning } from '../../../types/issues/warnings';
import { assignmentFqrn, crnTypeUrlMap } from './helpers';
import { useFetch } from '../../../helpers/hooks/useFetch';

type DataInterface = 'api' | 'dom';

interface AssignmentContextProps {
  dataInterface: DataInterface;
  children?: ReactNode;
  crnId: number | null;
  crnType: ContentResolutionNodeType;
  crnName: string | null;
}

interface BaseAssignmentContextValue {
  crnId: number;
  csId: number | null;
  crnType: ContentResolutionNodeType;
  crnName: string;
  hierarchy: ContentResolutionNode[];
  assignments: AnsibleContentAssignment[];
  handleAssignmentCreate: (
    assignments: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]
  ) => Promise<void>;
  handleAssignmentDestroy: (assignment: AnsibleContentAssignment) => Promise<void>;
  requestStatus: {
    getAssignments: 'IDLE' | 'PENDING' | 'RESOLVED' | 'ERROR';
  };
  // The context must provide this, such that these assignments can be rendered in an input and included in the form.
  domAssignments: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[];
  resolutionWarnings: ResolutionWarning[];
  refreshAssignments: () => void;
}

interface AssignmentContextDomValue extends BaseAssignmentContextValue {
  dataInterface: 'dom';
  assignments: ResolvedAssignment<AnsibleContentAssignment>[];
}

interface AssignmentContextApiValue extends BaseAssignmentContextValue {
  dataInterface: 'api';
  crnName: string;
  assignments: ResolvedAssignment<AnsibleContentAssignment>[];
}

export type AssignmentContextReturn = AssignmentContextDomValue | AssignmentContextApiValue;

export const AssignmentContext = createContext<AssignmentContextReturn | null>(null);

interface GetCrnAssignmentsResponse {
  assignments: (ResolvedAssignment<AnsibleContentAssignment>)[];
  hierarchy: ContentResolutionNode[];
  content_source: {
    id: number;
    type: string;
  };
}

export const AssignmentContextWrapper = ({
  dataInterface,
  crnId,
  crnName,
  crnType,
  children,
}: AssignmentContextProps): ReactElement => {

  const [domAssignments, setDomAssignments] = React.useState<
    AnsibleContentAssignmentCreate<AnsibleContentAssignment
    >[]>([]);

  const dispatch = useDispatch();

  const parentSelector = useLegacySelectValue<number | string>({
    selector: crnType === 'Hostgroup'
      ? `#${crnType.toLowerCase()}_parent_id`
      : `#${crnType.toLowerCase()}_hostgroup_id`,
  });

  // The "no value" option is an empty string
  const ansibleEnvSelector = useLegacySelectValue<number | string>({
    selector: `#${crnType.toLowerCase()}_ansible_lifecycle_environment_id`,
    attributeName: 'meta-lce-id',
  });

  const getCrnAssignmentsRequest = useFetch<
    DefaultResponse<
      AnsibleDirectorError,
      ResolutionWarning,
      GetCrnAssignmentsResponse
    >
  >(
    dataInterface === 'dom'
      ? {
        method: 'post',
        url: '/api/v2/ansible_director/assignments/preresolve',
        payload: JSON.stringify({
          node: {
            parent: parentSelector.value !== null && parentSelector.value !== ''
              ? {
                parent_type: 'hostgroup',
                parent_id: parentSelector.value,
              }
              : null,
            assignments: domAssignments,
            content_source: {
              cs_type: 'lce',
              cs_id: ansibleEnvSelector.value,
            },
            type: crnType,
          },
        }),
        enabled: ansibleEnvSelector.value !== null && ansibleEnvSelector.value !== '',
      }
      : {
        method: 'get',
        url: ansibleEnvSelector.value
          // We are in one of the "edit" UIs, where users can change cs_id without(!) saving
          ? `/api/v2/ansible_director/assignments/${crnTypeUrlMap[crnType]}/${crnId}/${ansibleEnvSelector.value}?resolve=true`
          // Host Details UI
          : `/api/v2/ansible_director/assignments/${crnTypeUrlMap[crnType]}/${crnId}?resolve=true`,
        enabled: crnId !== null,
      }
  );

  const handleApiUnassign = async (
    assignment: AnsibleContentAssignment | ResolvedAssignment<AnsibleContentAssignment>
  ): Promise<void> => {
    const fqrn = assignmentFqrn(assignment);
    try {
      await axios.delete(
        foremanUrl(`/api/v2/ansible_director/assignments/${assignment.id}`),
        {}
      );
      dispatch(
        addToast({
          type: 'success',
          key: `DELETE_ASSIGNMENT_${assignment.id}_SUCC`,
          message: __(_('Successfully unassigned "%(fqrn)s"!'), { fqrn }),
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `DELETE_ASSIGNMENT_${assignment.id}_ERR`,
          message: __(
            _(
              'Unassigning Ansible role "%(fqrn)s" failed with error code "%(error)s".'
            ),
            {
              fqrn,
              error: (e as { response: AxiosResponse }).response.status,
            }
          ),
          sticky: false,
        })
      );
    }
  };

  const handleApiAssign = async (assignments: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]): Promise<void> => {
    try {
      await axios.post(
        foremanUrl(
          `/api/v2/ansible_director/assignments/${crnTypeUrlMap[crnType]}/${crnId}`
        ),
        { assignments: assignments }
      );
      dispatch(
        addToast({
          type: 'success',
          key: `CREATE_ASSIGNMENTS_${crnType}_${crnId}_SUCC`,
          message: __(
            _(
              `Successfully assigned %(count)s ${
                assignments.length > 1 ? 'roles' : 'role'
              } to %(target)s!`
            ),
            {
              count: assignments.length,
              target: crnName as string,
            }
          ),
          sticky: false,
        })
      );
    } catch (e) {
      dispatch(
        addToast({
          type: 'danger',
          key: `CREATE_ASSIGNMENTS_${crnType}_${crnId}_ERR`,
          message: __(
            _(
              'Assigning Ansible roles to %(target)s failed with error code "%(error)s".'
            ),
            {
              target: crnName as string,
              error: (e as { response: AxiosResponse }).response.status,
            }
          ),
          sticky: false,
        })
      );
    }
  };

  const handleDomUnassign = async (
    assignment: AnsibleContentAssignment
  ): Promise<void> => {
    setDomAssignments(prevState => prevState.filter(domAssignment => {
      const domFqrn = assignmentFqrn(domAssignment);
      const assgnmntFqrn = assignmentFqrn(assignment);

      return domFqrn !== assgnmntFqrn;
    }));
  };

  const handleDomAssign = async (
    assignments: AnsibleContentAssignmentCreate<AnsibleContentAssignment>[]
  ): Promise<void> => {
    setDomAssignments([...domAssignments, ...assignments]);
  };

  const response = getCrnAssignmentsRequest.response;
  const results = response?.results;

  const safeHierarchy = results?.hierarchy ?? [];
  const safeAssignments = results?.assignments ?? [];
  const safeContentSourceId = results?.content_source?.id ?? null;
  const safeResolutionWarnings = response?.warnings ?? [];

  const baseContextValue = {
    crnType,
    csId: ansibleEnvSelector.value !== '' ? ansibleEnvSelector.value as number || safeContentSourceId : safeContentSourceId,
    assignments: safeAssignments,
    requestStatus: {
      getAssignments: getCrnAssignmentsRequest.status,
    },
    domAssignments,
    resolutionWarnings: safeResolutionWarnings,
    refreshAssignments: getCrnAssignmentsRequest.refetch,
  };

  const contextValue =
    dataInterface === 'api'
      ? {
        ...baseContextValue,
        dataInterface: 'api',
        crnId: crnId as number,
        crnName: crnName as string,
        hierarchy: safeHierarchy,
        handleAssignmentDestroy: handleApiUnassign,
        handleAssignmentCreate: handleApiAssign,

      } satisfies AssignmentContextApiValue
      : {
        ...baseContextValue,
        dataInterface: 'dom',
        crnId: -1,
        crnName: '',
        hierarchy: [...safeHierarchy, { id: -1, type: crnType, name: 'preresolved' }],
        handleAssignmentDestroy: handleDomUnassign,
        handleAssignmentCreate: handleDomAssign,
      } satisfies AssignmentContextDomValue;

  return (
    <AssignmentContext.Provider
      value={contextValue}
    >
      {children}
    </AssignmentContext.Provider>
  );
};
