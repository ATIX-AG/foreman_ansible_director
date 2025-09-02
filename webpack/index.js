import componentRegistry from 'foremanReact/components/componentRegistry';
import { CreateHostAnsibleContentTab } from './components/extensions/create_host_tab/CreateHostAnsibleContentTab';

componentRegistry.register({
  name: 'CreateHostAnsibleContentTab',
  type: CreateHostAnsibleContentTab,
});
