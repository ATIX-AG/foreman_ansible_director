import {
  AnsibleDirectorContext,
  useForemanContext,
} from 'foremanReact/Root/Context/ForemanContext';

const defaultContext: AnsibleDirectorContext = {
  settings: {
    ansible_director_default_galaxy_url: 'https://galaxy.ansible.com/',
    ansible_director_default_ansible_core_version: '2.19.3',
    ansible_director_ui_refresh_interval: 5,
  },
};
export const useAdContext = (): AnsibleDirectorContext => {
  const foremanCtx = useForemanContext()?.metadata?.foreman_ansible_director;
  return foremanCtx ?? defaultContext;
};
