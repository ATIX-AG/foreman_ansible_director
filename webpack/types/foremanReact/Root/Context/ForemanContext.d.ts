declare module 'foremanReact/Root/Context/ForemanContext' {
  import { Organization, Location } from '../../../common';
  // export declare function forceSingleton<T>(key: string, createFn: () => T): T | null;

  // export declare const getForemanContext: (
  //  contextData: any
  // ) => React.Context<any>;

  interface AnsibleDirectorContext {
    settings: {
      // eslint-disable-next-line camelcase
      ansible_director_default_galaxy_url: string;
      // eslint-disable-next-line camelcase
      ansible_director_default_ansible_core_version: string;
      // eslint-disable-next-line camelcase
      ansible_director_ui_refresh_interval: number;
    };
  }

  export interface ForemanContext {
    metadata: {
      organization: Organization | null;
      location: Location | null;
      // eslint-disable-next-line camelcase
      foreman_ansible_director: AnsibleDirectorContext;
    } | null;
  }

  export declare const useForemanContext: () => ForemanContext;

  // export declare const useForemanSetContext: () => any;

  // export declare const useForemanMetadata: () => Record<string, any>;

  // export declare const useForemanVersion: () => string | undefined;

  // export declare const useForemanSettings: () => Record<string, any>;

  // export declare const useForemanDocUrl: () => string | undefined;

  export declare const useForemanOrganization: () => Organization | undefined;

  export declare const useForemanLocation: () => Location | undefined;

  // export declare const useForemanUser: () => any;

  // export declare const getHostsPageUrl: (displayNewHostsPage: boolean) => string;

  // export declare const useForemanHostsPageUrl: () => string;

  // export declare const useForemanHostDetailsPageUrl: () => string;
}
