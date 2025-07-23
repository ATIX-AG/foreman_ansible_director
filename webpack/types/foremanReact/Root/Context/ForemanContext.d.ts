interface Organization {
  id: number;
  title: string;
}

declare module 'foremanReact/Root/Context/ForemanContext' {
  // export declare function forceSingleton<T>(key: string, createFn: () => T): T | null;

  // export declare const getForemanContext: (
  //  contextData: any
  // ) => React.Context<any>;

  // export declare const useForemanContext: () => any;

  // export declare const useForemanSetContext: () => any;

  // export declare const useForemanMetadata: () => Record<string, any>;

  // export declare const useForemanVersion: () => string | undefined;

  // export declare const useForemanSettings: () => Record<string, any>;

  // export declare const useForemanDocUrl: () => string | undefined;

  export declare const useForemanOrganization: () => Organization | null;

  // export declare const useForemanLocation: () => string | undefined;

  // export declare const useForemanUser: () => any;

  // export declare const getHostsPageUrl: (displayNewHostsPage: boolean) => string;

  // export declare const useForemanHostsPageUrl: () => string;

  // export declare const useForemanHostDetailsPageUrl: () => string;
}
