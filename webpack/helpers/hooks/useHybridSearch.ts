import { useEffect, useRef, useState } from 'react';
import {
  IndexResponse,
  useAPI,
  UseAPIReturn,
} from 'foremanReact/common/hooks/API/APIHooks';
import { DEBOUNCE_DELAY_MS } from '../constants';
import { useAdContext } from '../adContext';

type UseHybridSearchProps<TEntity, TOption> = UseHybridSearchPropsBase<
  TEntity,
  TOption
> &
  (Debounce | NoDebounce);

interface UseHybridSearchPropsBase<TEntity, TOption> {
  url: string;
  search: string;
  searchCacheSize?: number;
  localSearchFn: (items: TEntity[], term: string) => TEntity[];
  serverSearchFn?: (term: string) => string;
  transformationFn: (items: TEntity[]) => TOption[];
}

interface Debounce {
  debounce: true;
  debounceDelay?: number;
}

interface NoDebounce {
  debounce?: false;
  debounceDelay?: never;
}

interface UseHybridSearchResult<TOption> {
  status: UseAPIReturn<never>['status'];
  isUsingApi: boolean;
  options: TOption[];
  overflow: boolean;
  overflowCount: number;
  effectiveCacheSize: number;
  triggerApiSearch: () => void;
}

interface ApiGetResponse<TEntity> extends IndexResponse {
  results: TEntity[];
}

/**
 * A React hook that performs a hybrid client-server search for a list of entities (`TEntity[]`).
 * It fetches a limited set of results from the API (`per_page = searchCacheSize`) and performs local filtering
 * when possible. If local filtering yields no matches, it falls back to an (optionally debounced) server-side API request.
 *
 * @template TEntity - The type of entity returned by the API.
 * @template TOption - The transformed output type (e.g., for dropdown options or UI list items).
 *
 * @param {UseHybridSearchPropsBase<TEntity, TOption>} props
 * @param {string} props.url - The index endpoint URL for querying `TEntity` resources.
 * @param {string} props.search - The user-provided search input string used to filter `TEntity[]`.
 * @param {number} [props.searchCacheSize] - Maximum number of results to fetch and cache locally.
 *   Defaults to `ansible_director_ui_search_cache_size` from context if omitted.
 * @param {(items: TEntity[], term: string) => TEntity[]} props.localSearchFn
 *   A function that filters `TEntity[]` on the client using the search `term`.
 * @param {(term: string) => string} props.serverSearchFn
 * An optional function which can be used to construct the `search` query parameter. filters `TEntity[]` on the client using the search `term`.
 * Useful in case you want to build complex queries or, for example, filter by `title` instead of name.
 * This function is optional. By default, the query is `search = term`
 * @param {(items: TEntity[]) => TOption[]} props.transformationFn
 *   A function that transforms fetched and/or filtered `TEntity[]` into `TOption[]`.
 * @param {boolean} [props.debounce=false] - Whether to debounce server-side API requests triggered by `search` changes.
 * @param {number} [props.debounceDelay=600] - Debounce delay in milliseconds. Defaults to `DEBOUNCE_DELAY_MS`.
 *
 * @returns {UseHybridSearchResult<TOption>} A search state object containing:
 * @property {UseAPIReturn<never>['status']} status - The current `useAPI` request status.
 * @property {boolean} isUsingApi - `true` if the current result was obtained via server-side API,
 *   `false` if a result is found by local filtering.
 * @property {TOption[]} options - The filtered and transformed list of options.
 * @property {boolean} overflow - `true` if the server-side subtotal exceeds `effectiveCacheSize`.
 * @property {number} overflowCount - Number of additional items available on the server beyond `effectiveCacheSize`.
 * @property {number} effectiveCacheSize - The effective cache size used (`searchCacheSize` or default).
 * @property {() => void} triggerApiSearch - Imperative function to trigger an API-based search, regardless of the results of localSearchFn.
 *
 * @example
 * const {
 *   status,
 *   isUsingApi,
 *   options,
 *   overflow,
 *   overflowCount,
 *   effectiveCacheSize
 * } = useHybridSearch({
 *   url: '/api/v2/hosts',
 *   search: searchTerm,
 *   searchCacheSize: 50,
 *   localSearchFn: (hosts, term) => hosts.filter(host => host.name.includes(term)),
 *   transformationFn: hosts => hosts.map(host => ({ label: host.name, value: host.id })),
 *   debounce: true,
 *   debounceDelay: 400
 * });
 */
export const useHybridSearch = <TEntity, TOption>({
  url,
  search,
  searchCacheSize,
  localSearchFn,
  serverSearchFn,
  transformationFn,
  debounce,
  debounceDelay = DEBOUNCE_DELAY_MS,
}: UseHybridSearchProps<TEntity, TOption>): UseHybridSearchResult<TOption> => {
  const ctx = useAdContext();

  const maxResults =
    searchCacheSize || ctx.settings.ansible_director_ui_search_cache_size;
  const defaultParams = {
    per_page: maxResults,
  };

  const apiRequest = useAPI<ApiGetResponse<TEntity>>('get', url, {
    params: defaultParams,
  });

  const [status, setStatus] = useState<UseAPIReturn<never>['status']>(
    'PENDING'
  );
  const [options, setOptions] = useState<TEntity[]>([]);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [overflowCount, setOverflowCount] = useState<number>(0);
  const [isUsingApi, setIsUsingApi] = useState<boolean>(false);

  const isUsingApiRef = useRef<boolean>(false);

  const cachedItems = useRef<TEntity[]>([]);
  const hasCachedItems = useRef<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const currentUrlRef = useRef<string>(url);

  const searchRef = useRef<string>(search);
  searchRef.current = search;

  const performRequest = useRef<() => void>(() => {});
  performRequest.current = (): void => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setOptions([]);
    isUsingApiRef.current = true;
    setStatus('PENDING');
    setIsUsingApi(true);
    const currentSearch = searchRef.current;
    const searchParam =
      serverSearchFn !== undefined
        ? serverSearchFn(currentSearch)
        : currentSearch;
    apiRequest.setAPIOptions({
      params: { search: searchParam, ...defaultParams },
    });
  };

  const triggerApiSearch = (): void => {
    performRequest.current();
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    cachedItems.current = [];
    hasCachedItems.current = false;
    isUsingApiRef.current = false;
    currentUrlRef.current = url;
    setIsUsingApi(false);
    setStatus('PENDING');
    setOptions([]);
    apiRequest.setAPIOptions({ params: defaultParams });
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentUrlRef.current !== url) {
      return;
    }

    if (apiRequest.status === 'ERROR') {
      setStatus('ERROR');
      return;
    }

    if (apiRequest.status !== 'RESOLVED' || !apiRequest.response) {
      if (status !== 'RESOLVED') setStatus('PENDING');
      return;
    }

    const results: TEntity[] = apiRequest.response.results ?? [];

    const oFlow = apiRequest.response.subtotal - maxResults;
    setIsOverflowing(oFlow > 0);
    setOverflowCount(oFlow);

    if (isUsingApiRef.current) {
      setOptions(results);
      setStatus('RESOLVED');
    } else {
      cachedItems.current = results;
      hasCachedItems.current = true;
      setOptions(results);
      setStatus('RESOLVED');
    }
  }, [apiRequest.status, apiRequest.response]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search) {
      if (hasCachedItems.current) {
        setOptions(cachedItems.current);
        setStatus('RESOLVED');
      }
      if (isUsingApiRef.current) {
        isUsingApiRef.current = false;
        setIsUsingApi(false);
        apiRequest.setAPIOptions({ params: defaultParams });
      }
      return;
    }

    if (!hasCachedItems.current) {
      return;
    }

    const filtered = localSearchFn(cachedItems.current, search);

    if (filtered.length > 0) {
      setOptions(filtered);
      setStatus('RESOLVED');
      if (isUsingApiRef.current) {
        isUsingApiRef.current = false;
        setIsUsingApi(false);
        apiRequest.setAPIOptions({ params: defaultParams });
      }
    } else if (debounce) {
      debounceRef.current = setTimeout(() => {
        performRequest.current();
      }, debounceDelay);
    } else {
      performRequest.current();
    }
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    status,
    isUsingApi,
    options: transformationFn(options),
    overflow: isOverflowing,
    overflowCount,
    effectiveCacheSize: maxResults,
    triggerApiSearch,
  };
};
