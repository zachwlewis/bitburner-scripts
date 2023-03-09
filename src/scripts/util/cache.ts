import { NS } from '@ns';

export const get_cache_path = (resource: string, group: string): string => `/cache/${group}/${resource}.txt`;

/** Gets the requested cache resource. */
export function get_cache_resource<T>(ns: NS, resource: string, group: string): T | undefined {
  const path = get_cache_path(resource, group);
  const data = ns.read(path);
  if (data === '') return undefined;

  return <T>JSON.parse(data);
}

/** Sets the requested cache resource. */
export function set_cache_resource<T>(ns: NS, resource: string, group: string, value: T): void {
  const path = get_cache_path(resource, group);
  const data = JSON.stringify(value);
  ns.write(path, data, 'w');
}
