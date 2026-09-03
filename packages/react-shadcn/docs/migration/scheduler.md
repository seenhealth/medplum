# scheduler

| Upstream                                                            | Port                                                                         |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Scheduler.module.css` (flex container, 300px columns, gray border) | Tailwind: `flex min-h-[400px]`, `min-w-[300px] border-r border-gray-300 p-5` |
| `<Loader />`                                                        | `<Spinner />`                                                                |
| `<ResourceAvatar size="xl" />`                                      | `<ResourceAvatar className="size-12" />`                                     |
| `<Text size="xl" fw={500}>`                                         | `<p className="text-xl font-medium">`                                        |
| `<Button variant="outline" style={{ width: 150 }}>`                 | `<Button variant="outline" className="w-[150px]">`                           |
| `showNotification({ color: 'red', title, message })`                | `notify.error(message, title)`                                               |
