declare module 'foremanReact/components/PF4/TableIndexPage/TableIndexPage' {
  import React from 'react';
  import { APIOptions } from 'foremanReact/common/hooks/API/APIHooks';

  type ColumnProps = {
    title: string;
    wrapper?(cellValue: Object): React.JSX.Element;
    isSorted?: boolean;
  };

  type CustomActionButtons = {
    // TODO
  };

  type CustomToolbarItems = {
    // TODO
  };

  interface TableIndexPageProps {
    apiOptions?: APIOptions; // options object for API requests. See APIRequest.js for more details
    apiUrl: string; // url for the API to make requests to
    beforeToolbarComponent?: React.JSX.Element; // a component to be rendered before the toolbar
    breadcrumbOptions?: object; // props to send to the breadcrumb bar
    children?: React.ReactNode; // optional children to be rendered inside the page instead of the table
    columns: { [key: string]: ColumnProps }; // an object of objects representing the columns to be displayed in the table, keys should be the same as in the api response
    controller?: string; // the name of the controller for the API
    creatable?: boolean; // whether or not to show create button
    customActionButtons?: CustomActionButtons[]; // an array of custom action buttons to be displayed in the toolbar
    customCreateAction?: () => void; // a custom action for the create new button
    customExportURL?: string; // a custom URL for the export button
    customHelpURL?: string; // a custom URL for the documentation button
    customSearchProps?: object; // custom search props to send to the search bar
    customToolbarItems?: CustomToolbarItems[]; // an array of custom toolbar items to be displayed
    exportable?: boolean; // whether or not to show export button
    hasHelpPage?: boolean; // whether or not to show documentation button
    customHeader?: React.ReactNode; // a custom header to be rendered instead of the default header
    headerText?: string; // DEPRECATED - the header text for the page
    header?: string; // the header text for the page and the title
    isDeleteable?: boolean; // whether or not entries can be deleted
    searchable?: boolean; // whether or not the table can be searched
    selectionToolbar?: React.ReactNode; // Pass in the SelectAll toolbar, if desired
    replacementResponse?: object; // If included, skip the API request and use this response instead
    showCheckboxes?: boolean; // Whether or not to show selection checkboxes in the first column.
    rowSelectTd?(result: Object): React.JSX.Element; // A function that takes a single result object and returns a React component to be rendered in the first column.
    selectOne?: (id: string) => void; // Pass in the selectOne function from useBulkSelect, to use within rowSelectTd.
    isSelected?: (id: string) => boolean; // Pass in the isSelected function from useBulkSelect, to use within rowSelectTd.
    idColumn?: string; // The column name to use for RowSelectTd to pass to its selectOne function
    rowKebabItems?(result: Object): React.JSX.Element[]; // A function that takes a single result object and returns an array of kebab items to be displayed in the last column
    updateSearchQuery?: (query: string) => void; // Pass in the updateSearchQuery function returned from useBulkSelect.
    restrictedSearchQuery?: string; // Normalize the search query to add this to all search queries to restrict search results without altering the search input value. Useful for limiting results to an initial selection.
    updateParamsByUrl?: boolean; // If true, update pagination props from URL params. Default is true.
    bookmarksPosition?: 'left' | 'right'; // The position of the bookmarks dropdown. Default is 'left', which means the menu will take up space to its right.
  }

  const TableIndexPage: (props: TableIndexPageProps) => React.JSX.Element;

  export default TableIndexPage;
}
