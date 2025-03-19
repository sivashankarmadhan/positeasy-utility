import { SettingsSections, SettingsSectionsLabels } from 'src/constants/AppConstants';

// const { atom } = require('recoil');
// const { default: Types } = require('src/constants/Types');

import { atom } from 'recoil';
import Types from 'src/constants/Types';

const SelectedSection = atom({
  key: Types.SETTINGS.SELECTED_SECTION,
  default: SettingsSections[0].path,
});

const GstData = atom({
  key: Types.SETTINGS.GST_DATA,
  default: {},
});
const CustomerCodeMode = atom({
  key: Types.SETTINGS.CUSTOMER_CODE_MODE,
  default: false,
});
const CustomCodeMode = atom({
  key: Types.SETTINGS.CUSTOM_CODE_MODE,
  default: false,
});
const addOnMandatory = atom({
  key: Types.SETTINGS.ADDON_MODE,
  default: true,
});

export { SelectedSection, GstData, CustomerCodeMode, CustomCodeMode, addOnMandatory };
