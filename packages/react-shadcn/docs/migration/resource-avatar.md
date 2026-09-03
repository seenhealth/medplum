# resource-avatar

Upstream: `packages/react/src/ResourceAvatar/ResourceAvatar.tsx` (`ResourceAvatarProps extends AvatarProps`). Port: shadcn `Avatar` / `AvatarImage` / `AvatarFallback`.

| Upstream                                                    | Port                                                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Mantine `AvatarProps` (`radius`, `color`, `size` tokens, …) | `ComponentProps<typeof Avatar>` plus `value`, `link`, `src`, `alt`                                          |
| `size="xs"`                                                 | `className="size-4"`                                                                                        |
| `size="sm"`                                                 | `className="size-6"`                                                                                        |
| `size="md"` (default, 32px)                                 | `className="size-8"` (shadcn Avatar default)                                                                |
| `size="lg"`                                                 | `className="size-10"`                                                                                       |
| `size="xl"`                                                 | `className="size-12"`                                                                                       |
| `radius` / `color`                                          | `className` (`rounded-full` is the Avatar default; tint the fallback with e.g. `bg-blue-100 text-blue-800`) |
| `src`, `alt`                                                | kept (wired to `AvatarImage`)                                                                               |
| `value`, `link`                                             | unchanged                                                                                                   |

The root carries `title={displayString}` so initials/system avatars remain findable without an image. `getInitials` is unchanged (`resource-avatar-utils.ts`).
