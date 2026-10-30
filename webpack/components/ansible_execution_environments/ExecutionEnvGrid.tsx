import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  GalleryItem,
} from '@patternfly/react-core';
import ResourcesEmptyIcon from '@patternfly/react-icons/dist/esm/icons/resources-empty-icon';

import React, {
  ReactElement,
  useEffect,
} from 'react';
import { PaginationProps } from 'foremanReact/common/hooks/API/APIHooks';
import Pagination from 'foremanReact/components/Pagination';
import { usePermissions } from 'foremanReact/common/hooks/Permissions/permissionHooks';

import { GetAnsibleExecutionEnvResponse } from './components/ExecutionEnvGridWrapper';
import { ExecutionEnvCreateCard } from './components/ExecutionEnvCreateCard';
import {
  ExecutionEnvironment,
  ExecutionEnvironmentDraft,
} from '../../types/AnsibleExecutionEnvTypes';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ExecutionEnvCardWrapper } from './components/ExecutionEnvCardWrapper';

interface ExecutionEnvGridProps {
  apiResponse: GetAnsibleExecutionEnvResponse;
  onPagination: (newPagination: PaginationProps) => void;
  search: string;
  onSearch: (search: string) => void;
  createEnvAction: (draft: ExecutionEnvironmentDraft) => Promise<void>;
  refreshRequest: () => void;
}

export const ExecutionEnvGrid: React.FC<ExecutionEnvGridProps> = ({
  apiResponse,
  onPagination,
  createEnvAction,
  refreshRequest,
}) => {
  const [executionEnvironments, setExecutionEnvironments] = React.useState<
    ExecutionEnvironment[]
  >();
  const [totalItemsCount, setTotalItemsCount] = React.useState<number>();
  const [showCreateCard, setShowCreateCard] = React.useState<boolean>(false);

  const userCanCreate = usePermissions([
    AdPermissions.executionEnvironments.create,
  ]);

  useEffect(() => {
    setExecutionEnvironments(apiResponse.results);
    setTotalItemsCount(apiResponse.total);
  }, [apiResponse]);

  const grid = (content: ReactElement | ReactElement[]): ReactElement => (
    <div style={{ padding: '15px' }}>
      <Gallery
        hasGutter
        minWidths={{
          default: '100%',
          md: '100px',
          xl: '500px',
        }}
        maxWidths={{
          md: '300px',
          xl: '1fr',
        }}
      >
        {content}
      </Gallery>
    </div>
  );

  const createCard = (createModeOverride: boolean = false): ReactElement => (
    <ExecutionEnvCreateCard
      createEnvAction={createEnvAction}
      createModeOverride={createModeOverride}
    />
  );
  const gridContent = (): ReactElement | ReactElement[] | null => {
    if (executionEnvironments && executionEnvironments.length > 0) {
      return grid([
        ...(userCanCreate ? [createCard()] : []),
        ...executionEnvironments.map(ee => (
          <GalleryItem key={ee.id}>
            <ExecutionEnvCardWrapper
              executionEnv={ee}
              onDestroy={() => refreshRequest()}
            />
          </GalleryItem>
        )),
      ]);
    }

    if (showCreateCard) {
      return grid([createCard(true)]);
    }

    return (
      <EmptyState variant={EmptyStateVariant.xl}>
        <EmptyStateHeader
          headingLevel="h4"
          titleText="No Execution Environments"
          icon={<EmptyStateIcon icon={ResourcesEmptyIcon} />}
        />
        <EmptyStateBody>
          No Execution Environments found in this organization
        </EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant="primary"
              onClick={() => {
                setShowCreateCard(true);
              }}
            >
              Create Execution Environment
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  };

  return (
    <>
      {gridContent()}
      {totalItemsCount !== undefined && totalItemsCount > 0 && (
        <Pagination itemCount={totalItemsCount} onChange={onPagination} />
      )}
    </>
  );
};
