import { Gallery, GalleryItem } from '@patternfly/react-core';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import {
  APIOptions,
  PaginationProps,
} from 'foremanReact/common/hooks/API/APIHooks';
import { foremanUrl } from 'foremanReact/common/helpers';
import Pagination from 'foremanReact/components/Pagination';
import axios from 'axios';

import { ExecutionEnvCard } from './components/ExecutionEnvCard';
import { GetAnsibleExecutionEnvResponse } from './components/ExecutionEnvGridWrapper';
import { ExecutionEnvCreateCard } from './components/ExecutionEnvCreateCard';
import {
  AnsibleExecutionEnv,
  AnsibleExecutionEnvCreate,
} from '../../types/AnsibleExecutionEnvTypes';

interface ExecutionEnvGridProps {
  apiResponse: GetAnsibleExecutionEnvResponse;
  setAPIOptions: Dispatch<SetStateAction<APIOptions>>;
  onPagination: (newPagination: PaginationProps) => void;
  setConfirmationModalMode: Dispatch<SetStateAction<'destroy' | 'update'>>;
  setIsConfirmationModalOpen: Dispatch<SetStateAction<boolean>>;
  setConfirmationModalTitle: Dispatch<SetStateAction<string>>;
  setConfirmationModalBody: Dispatch<SetStateAction<string>>;
  selectedEnv: AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined;
  setSelectedEnv: Dispatch<
    SetStateAction<AnsibleExecutionEnv | AnsibleExecutionEnvCreate | undefined>
  >;
  createEnvAction: (env: AnsibleExecutionEnvCreate) => Promise<void>;
  setIsContentUnitModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ExecutionEnvGrid: React.FC<ExecutionEnvGridProps> = ({
  apiResponse,
  setAPIOptions,
  onPagination,
  setConfirmationModalMode,
  setIsConfirmationModalOpen,
  setConfirmationModalTitle,
  setConfirmationModalBody,
  selectedEnv,
  setSelectedEnv,
  createEnvAction,
  setIsContentUnitModalOpen,
}) => {
  const [executionEnvironments, setExecutionEnvironments] = React.useState<
    Array<AnsibleExecutionEnv>
  >();
  const [totalItemsCount, setTotalItemsCount] = React.useState<number>();

  useEffect(() => {
    setExecutionEnvironments(apiResponse.results);
    setTotalItemsCount(apiResponse.total);
  }, [apiResponse]);

  const destroyEnv = (env: AnsibleExecutionEnv): void => {
    setConfirmationModalTitle(`Confirm deletion of ${env?.name}`);
    setConfirmationModalBody(`Are you sure you want to destroy ${env?.name}?`);
    setConfirmationModalMode('destroy');
    setIsConfirmationModalOpen(true);
  };

  const updateEnv = (env: AnsibleExecutionEnv): void => {
    setConfirmationModalTitle(`Confirm update of ${env?.name}`);
    setConfirmationModalBody(
      `Are you sure you want to update ${env?.name}? This will require a rebuild of the associated image.`
    );
    setConfirmationModalMode('update');
    setIsConfirmationModalOpen(true);
  };

  return (
    <>
      {executionEnvironments && (
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
            <ExecutionEnvCreateCard
              createEnvAction={createEnvAction}
              setIsContentUnitModalOpen={setIsContentUnitModalOpen}
              setSelectedEnv={setSelectedEnv}
            />
            {executionEnvironments.map(ee => (
              <GalleryItem>
                <ExecutionEnvCard
                  key={ee.id}
                  executionEnv={ee}
                  handleDestroy={destroyEnv}
                  handleUpdate={updateEnv}
                  setSelectedEnv={setSelectedEnv}
                  setIsContentUnitModalOpen={setIsContentUnitModalOpen}
                />
              </GalleryItem>
            ))}
          </Gallery>
        </div>
      )}
      {totalItemsCount && (
        <Pagination itemCount={totalItemsCount} onChange={onPagination} />
      )}
    </>
  );
};
