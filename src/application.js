import { string } from 'yup';
import onChange from 'on-change';
import render from './render.js';

export default () => {
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
  }, render(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    state.form.fields.url = data.get('url').trim();
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

  elements.exampleUrl.addEventListener('click', (e) => {
    e.preventDefault();
    state.form.fields.url = e.target.innerHTML;
  });
};
