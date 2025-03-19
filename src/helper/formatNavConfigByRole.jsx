import { filter, find, forEach, get, isEmpty, map, some } from 'lodash';

export function formatNavConfigByRole(role, navConfig, blocked = []) {
  if (navConfig) {
    let finalData = [];
    map(navConfig, (data) => {
      const newConfig = [];
      forEach(get(data, 'items'), (e) => {
        const isAccess =
          some(get(e, 'roleAccess'), (d) => get(d, 'role') === role) &&
          !blocked.includes(get(e, 'path'));
        if (isAccess) {
          const filterData = filter(get(e, 'children'), (_child) => {
            const isAccessChildren = some(
              get(_child, 'roleAccess'),
              (d) => get(d, 'role') === role
            );
            if (isAccessChildren) {
              return !blocked.includes(get(_child, 'path'));
            } else {
              return false;
            }
          });
          console.log('filterData', filterData);
          newConfig.push({ ...e, ...(!isEmpty(filterData) ? { children: filterData } : {}) });
        }
      });
      const newNavConfig = {
        subheader: get(data, 'subheader') ? get(data, 'subheader') : null,
        items: [...newConfig],
      };
      finalData.push(newNavConfig);
    });

    return finalData;
  }
}
