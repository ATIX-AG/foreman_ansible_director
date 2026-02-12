import React, { ReactElement } from 'react';
import {
  PageSection,
  PageSectionVariants,
  TextContent,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  Text,
  ToolbarItem,
} from '@patternfly/react-core';

interface PageProps {
  header: string;
  children: ReactElement;
  customToolbarItems?: ReactElement[];
  // eslint-disable-next-line react/no-unused-prop-types
  hasDocumentation?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  docsUrl?: string;
  searchBar?: ReactElement;
}
export const Page = ({
  header,
  children,
  customToolbarItems,
  searchBar,
}: PageProps): ReactElement => (
  <div id="foreman-page">
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
          {searchBar && (
            <ToolbarGroup
              className="toolbar-group-search"
              variant="filter-group"
            >
              <ToolbarItem className="toolbar-search">{searchBar}</ToolbarItem>
            </ToolbarGroup>
          )}
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
