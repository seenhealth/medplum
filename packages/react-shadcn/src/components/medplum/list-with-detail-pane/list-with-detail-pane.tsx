// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// Modified from @medplum/react 5.1.36 packages/react/src/ListWithDetailPane/ListWithDetailPane.tsx for @medplum/react-shadcn (Apache-2.0 §4(b) notice)
import { ListWithDetailPaneSkeleton } from '@/components/medplum/list-with-detail-pane/list-with-detail-pane-skeleton';
import { MedplumLink } from '@/components/medplum/medplum-link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { getPaginationControlProps } from '@/lib/medplum/pagination';
import { cn } from '@/lib/utils';
import type { Resource } from '@medplum/fhirtypes';
import type { JSX, MouseEvent, ReactNode } from 'react';
import { useEffect, useRef } from 'react';

export interface ListWithDetailPaneTab {
  readonly value: string;
  readonly label: ReactNode;
  readonly uri: string;
}

export interface ListWithDetailPaneItemContext<T extends { id?: string } = Resource> {
  readonly selected: boolean;
  readonly index: number;
  readonly items: T[];
}

export interface ListWithDetailPaneDetailContext {
  readonly refresh: () => Promise<void>;
}

/**
 * Props shared by every ListWithDetailPane, independent of the header style.
 * @param items - The current page of items to render in the list.
 * @param loading - When true, the list area shows the skeleton instead of items.
 * @param selectedKey - Id of the highlighted row.
 * @param renderItem - Renders one row of the list sidebar.
 * @param emptyList - Shown when the list is empty. Default: dimmed "No items found".
 * @param skeleton - Shown while loading. Default: built-in skeleton rows.
 * @param listWidth - Sidebar width in pixels. Default 350.
 * @param headerActions - Right-aligned slot in the sidebar header row: action buttons, filter popovers.
 * @param selected - The resolved selected item, or undefined when nothing is selected.
 * @param renderDetail - Renders the detail pane for the selected item.
 * @param emptyDetail - Shown when nothing is selected. Default: dimmed prompt.
 * @param refresh - Passed through to the detail render context.
 * @param onSelectFirst - Auto-select escape hatch. Fired with the first item when the list has finished loading
 * (`loading` false) with items while nothing is selected (`selectedKey` undefined). The consumer decides how to
 * navigate (typically with history replace). Pass an id-driven `selectedKey` (e.g. the URL route param) so a
 * selection that is still resolving does not read as "nothing selected", and keep `loading` true from the render a
 * new search starts on, so this never fires against a stale list.
 * @param page - Current 1-based page. Pagination is hidden unless this, `pageCount`, and `onPageChange` are set.
 * @param pageCount - Total number of pages. Pagination is hidden when this is less than or equal to 1.
 * @param onPageChange - Fired by the built-in pagination with the new 1-based page.
 */
export interface ListWithDetailPanePropsBase<T extends { id?: string } = Resource> {
  readonly items: T[];
  readonly loading: boolean;
  readonly selectedKey?: string;
  readonly renderItem: (item: T, ctx: ListWithDetailPaneItemContext<T>) => ReactNode;
  readonly emptyList?: ReactNode;
  readonly skeleton?: ReactNode;
  readonly listWidth?: number;
  readonly headerActions?: ReactNode;
  readonly selected: T | undefined;
  readonly renderDetail: (selected: T, ctx: ListWithDetailPaneDetailContext) => ReactNode;
  readonly emptyDetail?: ReactNode;
  readonly refresh: () => Promise<void>;
  readonly onSelectFirst?: (item: T) => void;
  readonly page?: number;
  readonly pageCount?: number;
  readonly onPageChange?: (page: number) => void;
}

/**
 * Plain-text header (or no header at all). Declares the tab fields as `never` so a title
 * can't be mixed with tabs.
 * @param headerText - Plain title shown at the left of the header.
 */
export interface ListWithDetailPaneTextHeaderProps {
  readonly headerText?: ReactNode;
  readonly tabs?: never;
  readonly activeTab?: never;
}

/**
 * Pill-tab header. Declares `headerText` as `never` so tabs can't be mixed with a title.
 * Each tab renders as a link to its `uri`, so tab switching needs no change callback.
 * @param tabs - Sidebar header tabs. Selecting a tab navigates to its URI.
 * @param activeTab - Controlled active tab value; consumers derive it from the URL.
 */
export interface ListWithDetailPaneTabsHeaderProps {
  readonly tabs: ListWithDetailPaneTab[];
  readonly activeTab?: string;
  readonly headerText?: never;
}

/** The sidebar header is plain text or pill tabs, never both. */
export type ListWithDetailPaneHeaderProps = ListWithDetailPaneTextHeaderProps | ListWithDetailPaneTabsHeaderProps;

export type ListWithDetailPaneProps<T extends { id?: string } = Resource> = ListWithDetailPanePropsBase<T> &
  ListWithDetailPaneHeaderProps;

// Configs
const DEFAULT_LIST_WIDTH = 350;
const HEADER_HEIGHT = 64;

/**
 * ListWithDetailPane is a generic, presentational master-detail shell: a left sidebar
 * with optional pill tabs, header actions, a scrollable list, and pagination, plus a
 * detail area for the selected item. It does no data fetching — it renders what it is
 * given, navigates via links, and emits `onPageChange` / `onSelectFirst` callbacks.
 * @param props - The ListWithDetailPane React props.
 * @returns The ListWithDetailPane React node.
 */
export function ListWithDetailPane<T extends { id?: string } = Resource>(
  props: ListWithDetailPaneProps<T>
): JSX.Element {
  const {
    items,
    loading,
    selectedKey,
    renderItem,
    emptyList,
    skeleton,
    listWidth = DEFAULT_LIST_WIDTH,
    headerText,
    tabs,
    activeTab,
    headerActions,
    selected,
    renderDetail,
    emptyDetail,
    refresh,
    onSelectFirst,
    page,
    pageCount,
    onPageChange,
  } = props;

  // Latest-ref pattern: consumers routinely pass onSelectFirst as an inline arrow, and a
  // changing identity must not refire the auto-select effect (firing on every render
  // would loop with consumers that navigate on select).
  const onSelectFirstRef = useRef(onSelectFirst);
  useEffect(() => {
    onSelectFirstRef.current = onSelectFirst;
  });

  // Auto-select the first item when a load settles with items and no selection intended.
  useEffect(() => {
    if (!loading && selectedKey === undefined && items.length > 0) {
      onSelectFirstRef.current?.(items[0]);
    }
  }, [loading, selectedKey, items]);

  let headerLeft: ReactNode = <span />;
  if (tabs) {
    headerLeft = (
      <Tabs value={activeTab} className="gap-0">
        <TabsList variant="line" className="h-8 gap-0.5 bg-transparent p-0">
          {tabs.map((tab) => (
            // Render the pill itself as the link. Nesting an anchor inside the tab
            // button would leave the pill's padding dead (the anchor stops the click
            // from reaching the button) and is invalid interactive nesting. Mantine's
            // own onClick is dropped: navigation is the link's job, so there is one
            // code path and no tab-change callback to wire up.
            <MedplumLink
              key={tab.value}
              to={tab.uri}
              data-active={tab.value === activeTab ? true : undefined}
              className={cn(
                'flex h-8 items-center justify-center rounded-full px-3.5 text-sm leading-none font-medium no-underline transition-colors hover:bg-muted hover:no-underline',
                tab.value === activeTab
                  ? 'bg-muted text-foreground hover:bg-muted'
                  : 'bg-transparent text-muted-foreground'
              )}
            >
              {tab.label}
            </MedplumLink>
          ))}
        </TabsList>
      </Tabs>
    );
  } else if (headerText !== undefined) {
    headerLeft = <p className="ps-2 text-sm leading-[1.2] font-medium text-foreground">{headerText}</p>;
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex h-full flex-col border-r bg-background" style={{ width: listWidth }}>
        {(tabs || headerActions || headerText) && (
          <>
            <div className="flex items-center justify-between p-4" style={{ height: HEADER_HEIGHT }}>
              {headerLeft}
              {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
            </div>
            <Separator />
          </>
        )}
        <ScrollArea className="min-h-0 flex-1">
          {loading && (skeleton ?? <ListWithDetailPaneSkeleton />)}
          {!loading && items.length === 0 && (emptyList ?? <DefaultEmptyList />)}
          {!loading && items.length > 0 && (
            <div className="p-2">
              {items.map((item, index) => {
                const isSelected = item.id !== undefined && item.id === selectedKey;
                return (
                  <div
                    key={item.id ?? index}
                    className={cn(
                      'cursor-pointer rounded-lg transition-colors duration-200 hover:bg-muted/80',
                      isSelected && 'bg-muted hover:bg-muted'
                    )}
                  >
                    {renderItem(item, { selected: isSelected, index, items })}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        {onPageChange !== undefined && page !== undefined && pageCount !== undefined && pageCount > 1 && (
          <div className="flex items-center justify-center px-4 py-[15px]">
            <ListPagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
          </div>
        )}
      </div>
      {selected === undefined ? (
        <div className="h-full min-w-0 flex-1">{emptyDetail ?? <DefaultEmptyDetail />}</div>
      ) : (
        renderDetail(selected, { refresh })
      )}
    </div>
  );
}

function DefaultEmptyList(): JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center pt-8">
      <p className="font-medium text-muted-foreground">No items found</p>
    </div>
  );
}

function DefaultEmptyDetail(): JSX.Element {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-sm text-muted-foreground">Select an item from the list to view details</p>
      </div>
    </div>
  );
}

function ListPagination(props: {
  readonly page: number;
  readonly pageCount: number;
  readonly onPageChange: (page: number) => void;
}): JSX.Element {
  const { page, pageCount, onPageChange } = props;

  const goTo = (next: number) => (event: MouseEvent) => {
    event.preventDefault();
    if (next >= 1 && next <= pageCount && next !== page) {
      onPageChange(next);
    }
  };

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            size="sm"
            className="h-8 px-2"
            aria-disabled={page <= 1 || undefined}
            {...getPaginationControlProps('previous')}
            onClick={goTo(page - 1)}
          />
        </PaginationItem>
        {getPageItems(page, pageCount, 1, 1).map((item, index) =>
          item === 'dots' ? (
            <PaginationItem key={`dots-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href="#" size="icon-sm" isActive={item === page} onClick={goTo(item)}>
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            size="sm"
            className="h-8 px-2"
            aria-disabled={page >= pageCount || undefined}
            {...getPaginationControlProps('next')}
            onClick={goTo(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function getRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}

function getPageItems(page: number, total: number, siblings: number, boundaries: number): (number | 'dots')[] {
  const totalNumbers = siblings * 2 + 3 + boundaries * 2;
  if (totalNumbers >= total) {
    return getRange(1, total);
  }

  const leftSiblingIndex = Math.max(page - siblings, boundaries + 2);
  const rightSiblingIndex = Math.min(page + siblings, total - (boundaries + 1));
  const shouldShowLeftDots = leftSiblingIndex > boundaries + 2;
  const shouldShowRightDots = rightSiblingIndex < total - (boundaries + 1);

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = siblings * 2 + boundaries + 2;
    return [...getRange(1, leftItemCount), 'dots', ...getRange(total - (boundaries - 1), total)];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = boundaries + 1 + 2 * siblings;
    return [...getRange(1, boundaries), 'dots', ...getRange(total - rightItemCount, total)];
  }

  return [
    ...getRange(1, boundaries),
    'dots',
    ...getRange(leftSiblingIndex, rightSiblingIndex),
    'dots',
    ...getRange(total - boundaries + 1, total),
  ];
}
