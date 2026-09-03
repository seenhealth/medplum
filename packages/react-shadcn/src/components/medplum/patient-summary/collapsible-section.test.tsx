// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/PatientSummary/CollapsibleSection.test.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { CollapsibleSection } from '@/components/medplum/patient-summary/collapsible-section';
import { act, fireEvent, render, screen } from '@/test/render';

describe('CollapsibleSection', () => {
  test('Renders with title and children', () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('Collapses and expands when clicking chevron', async () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const content = screen.getByText('Test Content');
    expect(content).toBeInTheDocument();

    const chevronButton = screen.getByLabelText('Hide test section');

    await act(async () => {
      fireEvent.click(chevronButton);
    });

    expect(screen.getByLabelText('Show test section')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Show test section'));
    });

    expect(screen.getByLabelText('Hide test section')).toBeInTheDocument();
  });

  test('Collapses and expands when clicking title', async () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const content = screen.getByText('Test Content');
    expect(content).toBeInTheDocument();

    const title = screen.getByText('Test Section');

    await act(async () => {
      fireEvent.click(title);
    });

    expect(screen.getByLabelText('Show test section')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(title);
    });

    expect(screen.getByLabelText('Hide test section')).toBeInTheDocument();
  });

  test('Shows add button when onAdd is provided', () => {
    const onAdd = vi.fn();
    render(
      <CollapsibleSection title="Test Section" onAdd={onAdd}>
        <div>Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByLabelText('Add item')).toBeInTheDocument();
  });

  test('Does not show add button when onAdd is not provided', () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSection>
    );

    expect(screen.queryByLabelText('Add item')).not.toBeInTheDocument();
  });

  test('Calls onAdd when add button is clicked', async () => {
    const onAdd = vi.fn();
    render(
      <CollapsibleSection title="Test Section" onAdd={onAdd}>
        <div>Test Content</div>
      </CollapsibleSection>
    );

    const addButton = screen.getByLabelText('Add item');

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
