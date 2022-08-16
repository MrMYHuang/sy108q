import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as en from './locales/en/translation.json';
import * as zh from './locales/zh/translation.json';

i18n
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        fallbackLng: 'en',
        debug: true,

        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        }
    });

i18n.addResources('en', 'translation', en);
i18n.addResources('zh', 'translation', zh);

export default i18n;
