# link-tabs

Upstream: `packages/react/src/LinkTabs/LinkTabs.tsx` (`LinkTabsProps extends Omit<TabsProps, 'value' \| 'onChange'>`). Port: shadcn `Tabs` / `TabsList` / `TabsTrigger` wrapping `MedplumLink` (the tab stays a button so tests can `querySelector('a')`; putting `asChild` on `MedplumLink` would make the tab the `<a>`).

| Upstream | Port |
| --- | --- |
| `Omit<TabsProps, 'value' \| 'onChange'>` | `Omit<ComponentProps<typeof Tabs>, 'value' \| 'onValueChange'>` |
| `onChange` | `onValueChange` (internal; not part of the public props) |
| `children?: React.ReactNode` | `children?: ReactNode` (same type, imported) |
| `Tabs.Tab` + Mantine `Anchor` | `TabsTrigger` + `MedplumLink` (trigger `onClick` calls `navigate` because Radix activates on mouseDown, while the unit tests `fireEvent.click`) |
| `LinkTabs.module.css` `.list` / `.link` | `flex-nowrap whitespace-nowrap` on the list; `leading-none no-underline` on the link |

`baseUrl`, `tabs`, and `TabDefinition` are unchanged. Left-click still `preventDefault`s and `navigate()`s; aux-clicks keep the native href.
