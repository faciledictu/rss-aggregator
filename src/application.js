import i18next from 'i18next';
import { setLocale } from 'yup';

import init from './init.js';
import resources from './locales/index.js';

export default () => {
  const lng = 'ru';

  setLocale({
    mixed: {
      default: 'errors.default',
      notOneOf: 'errors.notOneOf',
    },
    string: {
      url: 'errors.url',
    },
  });

  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng,
    debug: true,
    resources,
  }).then(() => {
    init(i18nInstance);
  });
};
