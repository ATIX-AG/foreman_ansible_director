import React from 'react';
import { render, screen } from '@testing-library/react';
import { Page } from '../Page';

describe('Page', () => {
  it('renders children with header', () => {
    render(
      <Page header="TEST">
        <div>TEST_CHILD</div>
      </Page>
    );

    expect(screen.getByText('TEST')).toBeInTheDocument();
    expect(screen.getByText('TEST_CHILD')).toBeInTheDocument();
  });

  it('renders toolbar items', () => {
    render(
      <Page
        header="TEST"
        customToolbarItems={[<div key="test-tb-item">TEST_TOOLBAR_ITEM</div>]}
      >
        <div>TEST_CHILD</div>
      </Page>
    );

    expect(screen.getByText('TEST_TOOLBAR_ITEM')).toBeInTheDocument();
  });
});
