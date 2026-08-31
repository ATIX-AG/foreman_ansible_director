import React, { ReactNode, createContext, ReactElement } from 'react';
import {
  WithResolvedVariables,
} from '../../../../../types/AnsibleVariableTypes';
import {
  AnsibleContentAssignment,
  ContentResolutionNode,
  ContentResolutionNodeType,

} from '../../../../../types/AnsibleContentAssignmentTypes';
import { useFetch } from '../../../../../helpers/hooks/useFetch';
import { DefaultResponse } from '../../../../../types/common';
import { AnsibleDirectorError } from '../../../../../types/issues/errors';
import { crnTypeUrlMap } from '../../helpers';
import { TabDraft } from './components/BindingDetailModal';
import { AnsibleVariable } from '../../../../../resources/clients/AnsibleVariable';
import { AnsibleVariableBinding } from '../../../../../resources/clients/AnsibleVariableBinding';
import { useToasts } from '../../../../../helpers/toasts/useToasts';

type DataInterface = 'api' | 'dom';

interface VariableContextProps {
  dataInterface: DataInterface;
  children?: ReactNode;
  crnId: number | null;
  crnType: ContentResolutionNodeType;
}

interface BaseVariableContextValue {
  crnId: number;
  crnType: ContentResolutionNodeType;
  assignmentsWithVariables: WithResolvedVariables<AnsibleContentAssignment>[];
  resolutionHierarchy: ContentResolutionNode[];
  handleManagementConfirm: (actionableDrafts: TabDraft[]) => Promise<unknown>;
}

interface VariableContextDomValue extends BaseVariableContextValue {
  dataInterface: 'dom';
}

interface VariableContextApiValue extends BaseVariableContextValue {
  dataInterface: 'api';
}

export type VariableContextReturn = VariableContextDomValue | VariableContextApiValue;

export const VariableContext = createContext<VariableContextReturn | null>(null);

interface GetCrnVariablesResponse {
  assignments: WithResolvedVariables<AnsibleContentAssignment>[];
  hierarchy: ContentResolutionNode[];
}

export const VariableContextWrapper = ({
  dataInterface,
  crnId,
  crnType,
  children,
}: VariableContextProps): ReactElement => {

  const { withToast } = useToasts();

  const getCrnVariablesRequest = useFetch<
    DefaultResponse<
      AnsibleDirectorError,
      never,
      GetCrnVariablesResponse
    >
  >(
    {
      method: 'get',
      url: `/api/v2/ansible_director/ansible_variables/${crnTypeUrlMap[crnType]}/${crnId}?resolve=true`,
      enabled: crnId !== null,
    }
  );

  const handleManagementConfirmApi = (actionableDrafts: TabDraft[]): Promise<unknown> => {
    const requests: Promise<unknown>[] = [];
    actionableDrafts.forEach(draft => {
      switch (draft.operation) {
        case 'editVariable':
          requests.push(withToast(
            {
              type: 'update',
              resource: 'ansible_variable',
              func: AnsibleVariable.updatePartial(draft.sourceObject.id, {
                ansible_variable: {
                  data_type: draft.type,
                  raw_value: draft.value,
                },
              }),
            }
          ));
          break;
        case 'editBinding':
          requests.push(withToast({
            type: 'update',
            resource: 'ansible_variable_binding',
            func: AnsibleVariableBinding.updatePartial(draft.sourceObject.id, {
              ansible_variable_binding: {
                data_type: draft.type,
                raw_value: draft.value,
              },
            }),
          }));
          break;
      }
    });

    return Promise.all(requests);
  };

  const response = getCrnVariablesRequest.response;
  const results = response?.results;
  const safeAssignmentsWithVariables = results?.assignments ?? [];
  const safeResolutionHierarchy = results?.hierarchy ?? [];

  const baseContextValue = {
    crnType,
    assignmentsWithVariables: safeAssignmentsWithVariables,
  };

  const contextValue =
    dataInterface === 'api'
      ? {
        ...baseContextValue,
        dataInterface: 'api',
        crnId: crnId as number,
        resolutionHierarchy: safeResolutionHierarchy,
        handleManagementConfirm: handleManagementConfirmApi,
      } satisfies VariableContextApiValue
      : {
        ...baseContextValue,
        dataInterface: 'dom',
        crnId: -1,
        resolutionHierarchy: safeResolutionHierarchy,
        handleManagementConfirm: handleManagementConfirmApi,
      } satisfies VariableContextDomValue;

  return (
    <VariableContext.Provider
      value={contextValue}
    >
      {children}
    </VariableContext.Provider>
  );
};
