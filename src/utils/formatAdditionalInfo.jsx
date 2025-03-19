import { map } from 'lodash';
import { get, isEmpty } from 'lodash';

const formatAdditionalInfo = (data) => {
  if (isEmpty(data) || !data) return '';
  let formatted = '';
  map(data, (e, index) => {
    if (index === 0) formatted += `${get(e, 'info', '')}`;
    else formatted += `\n${get(e, 'info', '')}`;
  });
  formatted?.replace('\n', '');
  return formatted;
};

export default formatAdditionalInfo;
