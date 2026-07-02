import React from 'react';
import AnsibleExecutionEnvPage from './AnsibleExecutionEnvPage';
import { AdPermissions } from '../../constants/foremanAnsibleDirectorPermissions';
import { ForceTaxonomy } from '../common/ForceTaxonomy';
import { Permitted } from '../common/Permitted';

interface TypeRegistry {}

export type ExtractRecordFromUnion<Union> = {
  [K in keyof TypeRegistry as TypeRegistry[K] extends Union ? K : never]: TypeRegistry[K]
};





const AnsibleExecutionEnvPageWrapper: React.FC = () => (
    <Permitted requiredPermissions={[AdPermissions.executionEnvironments.view]}>
    <ForceTaxonomy organization>
      <AnsibleExecutionEnvPage />
    </ForceTaxonomy>
  </Permitted>
);

export default AnsibleExecutionEnvPageWrapper;
