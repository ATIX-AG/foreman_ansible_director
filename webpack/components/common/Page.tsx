import React, { ReactElement } from 'react';
import {
  PageSection,
  PageSectionVariants,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  Text,
} from '@patternfly/react-core';

import { Helmet as HelmetImport, HelmetProps } from 'react-helmet';

const Helmet = (HelmetImport as unknown) as React.ComponentClass<HelmetProps>;

interface PageProps {
  header: string;
  children: ReactElement;
  customToolbarItems: ReactElement[];
  // eslint-disable-next-line react/no-unused-prop-types
  hasDocumentation: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  docsUrl?: string;
}
export const Page = ({
  header,
  children,
  customToolbarItems,
}: PageProps): ReactElement => (
  <div id="foreman-page">
    <Helmet>
      <title>{header}</title>
    </Helmet>
    <PageSection
      variant={PageSectionVariants.light}
      className="table-title-section"
    >
      <TextContent>
        <Text ouiaId="header-text" component="h1">
          {header}
        </Text>
      </TextContent>
    </PageSection>
    <PageSection
      variant={PageSectionVariants.light}
      className="table-toolbar-section"
    >
      <Toolbar ouiaId="table-toolbar" className="table-toolbar">
        <ToolbarContent>
          {/* {searchable && (
            <ToolbarGroup
              className="toolbar-group-search"
              variant="filter-group"
            >
              {selectionToolbar}
              <ToolbarItem className="toolbar-search">
                <SearchBar
                  data={searchProps}
                  initialQuery=""
                  restrictedSearchQuery={restrictedSearchQuery}
                  onSearch={onSearch}
                  bookmarksPosition={bookmarksPosition}
                />
              </ToolbarItem>
              {status === STATUS.PENDING && (
                <ToolbarItem>
                  <Spinner size="sm" />
                </ToolbarItem>
              )}
            </ToolbarGroup>
          )} */}
          {customToolbarItems && (
            <ToolbarGroup
              align={{ default: 'alignRight' }}
              className="table-toolbar-actions"
              variant="button-group"
            >
              {customToolbarItems && customToolbarItems}
            </ToolbarGroup>
          )}
        </ToolbarContent>
      </Toolbar>
    </PageSection>
    <PageSection variant={PageSectionVariants.light} className="table-section">
      {children}
    </PageSection>
  </div>
);
