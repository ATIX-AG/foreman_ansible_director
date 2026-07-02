import { foremanUrl } from 'foremanReact/common/helpers';
import { AnsibleDirectorWarning } from '../types/issues/warnings';
import { AnsibleDirectorError } from '../types/issues/errors';
import { ExtractRecordFromUnion } from './types';

interface ApiResponseSuccess<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning
> {
  status: 'success';
  ok: true;
  warnings: TWarning[];
  updated: ExtractRecordFromUnion<TUpdated>;
  created: ExtractRecordFromUnion<TCreated>;
  deleted: TDeleted[];
}

interface ApiResponseWarning<TWarning extends AnsibleDirectorWarning> {
  status: 'warning';
  ok: true;
  warnings: TWarning[];
  updated: never;
  created: never;
  deleted: never;
  errors: never;
}

interface ApiResponseError<TError extends AnsibleDirectorError> {
  status: 'error';
  ok: false;
  errors: TError[];
  warnings: never;
  updated: never;
  created: never;
  deleted: never;
}

export type ApiResponse<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError
> =
  | ApiResponseSuccess<TCreated, TUpdated, TDeleted, TWarning>
  | ApiResponseWarning<TWarning>
  | ApiResponseError<TError>;

type BackendRequest<TPayload, TQueryParams> = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
} & ([TPayload] extends [never] ? {} : { payload: TPayload }) &
  ([TQueryParams] extends [never] ? {} : { queryParams: TQueryParams });

const getcsrfToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]');

  // The CSRF token is stored inside this HTML element.
  // There is no proper way to type this.
  // @ts-ignore TS2339
  return token ? token.content : '';
};

export async function backendRequest<
  TCreated,
  TUpdated,
  TDeleted,
  TWarning extends AnsibleDirectorWarning,
  TError extends AnsibleDirectorError,
  TPayload,
  TParams
> (
  request: BackendRequest<TPayload, TParams>
): Promise<ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>> {
  const payload = 'payload' in request ? request.payload : undefined;
  const queryParams =
    'queryParams' in request ? request.queryParams : undefined;
  const { method, path } = request;

  let url: string = path;

  if (queryParams !== undefined) {
    url = path.replace(/:(\w+)/g, (_, paramName) => {
      // This is about as far as I'll go. For this to fail,
      // the compiler must have been ignored many times beforehand.
      // @ts-ignore TS7053
      const value = queryParams[paramName];
      return String(value);
    });
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getcsrfToken(),
      Accept: 'application/json',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  };

  const response = await fetch(foremanUrl(url), options);

  let responseJson = null;
  let responseErrors: AnsibleDirectorError[] = [];

  try {
    responseJson = await response.json();
    responseErrors = responseJson.errors satisfies TError[];
  }
  catch (e) {
    responseErrors.push({
      type: 'error',
      title: 'Request error',
      message: e instanceof Error ? e.message : '',
    } satisfies AnsibleDirectorError);
  }

  if (!response.ok) {
    if (response.status > 500 && response.status !== 0) {
      responseErrors.push({
        type: 'error',
        title: `HTTP error ${response.status}`,
        message: response.statusText,
      } satisfies AnsibleDirectorError);
    }
  }

  return (responseJson !== null && responseJson.status === 'success'
    ? {
      status: 'success' as const,
      ok: true,
      errors: [] as never,
      warnings: responseJson.warnings satisfies TWarning[],
      created: responseJson.created satisfies TCreated[],
      updated: responseJson.updated satisfies TUpdated[],
      deleted: responseJson.deleted satisfies TDeleted[],
    }
    : {
      status: 'error' as const,
      ok: false,
      errors: responseErrors as TError[],
      warnings: [] as never,
      created: [] as never,
      updated: [] as never,
      deleted: [] as never,
    }) as ApiResponse<TCreated, TUpdated, TDeleted, TWarning, TError>;
}
