declare module 'foremanReact/components/SearchBar' {
  import { ReactElement } from 'react';

  interface AutoCompleteData {
    id: string;
    url: string;
    searchQuery?: string;
  }
  interface SearchBarData {
    autocomplete: AutoCompleteData;
    controller?: string;
    bookmarks?: BookmarksProps;
  }

  interface SearchBarProps {
    data: SearchBarData;

    initialQuery?: string;
    onSearch?: (query: string) => void;
    restrictedSearchQuery?: (query: string) => string;
    onSearchChange?: (newValue: string) => void;
    name: string;
    bookmarksPosition?: 'right' | 'left';
  }

  const SearchBar: (props: SearchBarProps) => ReactElement;

  export default SearchBar;
}
