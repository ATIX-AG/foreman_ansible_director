import React from 'react';

import { registerRoutes } from 'foremanReact/routes/RoutingService';
import { addGlobalFill } from 'foremanReact/components/common/Fill/GlobalFill';
import { translate as _ } from 'foremanReact/common/I18n';
import routes from './routes/routes';
import { HostDetailsTab } from './components/extensions/host_details/HostDetailsTab/HostDetailsTab';
import { HostDetailsLceCard } from './components/extensions/host_details/HostDetailsLceCard/HostDetailsLceCard';

const fills = [
  {
    slot: 'host-details-page-tabs',
    name: _('Ansible'),
    component: props => <HostDetailsTab {...props} />,
    weight: 500,
    metadata: { title: 'Ansible' },
  },
  {
    slot: 'host-overview-cards',
    name: _('Ansible environment'),
    component: props => <HostDetailsLceCard {...props} />,
    weight: 3700,
    metadata: { title: _('Ansible') },
  },
];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const registerFills = () => {
  fills.forEach(({ slot, name, component: Component, weight, metadata }) =>
    addGlobalFill(
      slot,
      name,
      <Component key={`ansible-fill-${name}`} />,
      weight,
      metadata
    )
  );
};

registerRoutes('foreman_ansible_director', routes);
registerFills();
