import onChange from 'on-change';
import { string } from 'yup';

import render from './render.js';

export default (i18nInstance) => {
  const elements = {
    urlInput: document.getElementById('url-input'),
    form: document.querySelector('.rss-form'),
    exampleUrl: document.querySelector('.example-url'),
    feedback: document.querySelector('.feedback'),
  };

  const state = onChange({
    form: {
      fields: { url: '' },
      error: {},
    },
    urls: [],
  }, render(elements, i18nInstance));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const schema = string().url().notOneOf(state.urls);

    schema.validate(state.form.fields.url)
      .then(() => {
        state.urls.push(state.form.fields.url);
        state.form.fields.url = '';
      })
      .catch((error) => {
        state.form.error = error;
      })
      .finally(() => {
        elements.urlInput.focus();
      });
  });

  elements.urlInput.addEventListener('change', (e) => {
    state.form.fields.url = e.target.value.trim();
  });

  elements.exampleUrl.addEventListener('click', (e) => {
    e.preventDefault();
    state.form.fields.url = e.target.innerHTML;
  });
};
