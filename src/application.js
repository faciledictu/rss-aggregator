import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import { setLocale, string } from 'yup';

import resources from './locales/index.js';
import render from './render.js';
import parseRSS from './utils/parser.js';

const domParser = new DOMParser();

const getAllOriginsResponse = (url) => {
  const allOriginsLink = 'https://allorigins.hexlet.app/get';

  const workingUrl = new URL(allOriginsLink);
  workingUrl.searchParams.set('disableCache', 'true');
  workingUrl.searchParams.set('url', url);

  return axios.get(workingUrl);
};

const extractAllOriginsContents = (response) => {
  if (response.data.status.error) {
    return Promise.reject(new Error('RequestError'));
  }

  const responseCode = response.data.status.http_code;
  if (responseCode >= 300 || responseCode < 200) {
    return Promise.reject(new Error('RequestError'));
  }

  const responseData = response.data.contents;
  return Promise.resolve(responseData);
};

const getHttpContents = (url) => getAllOriginsResponse(url)
  .catch(() => Promise.reject(new Error('networkError')))
  .then(extractAllOriginsContents);

export default () => {
  const lng = 'ru';

  setLocale({
    mixed: {
      default: 'default',
      notOneOf: 'alreadyExists',
    },
    string: {
      url: 'invalidUrl',
    },
  });

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng,
      debug: true,
      resources,
    })
    .then(() => {
      const elements = {
        urlInput: document.getElementById('url-input'),
        form: document.querySelector('.rss-form'),
        exampleUrl: document.querySelector('.example-url'),
        feedback: document.querySelector('.feedback'),
        submitButton: document.querySelector('button[type="submit"]'),
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
      };

      const state = onChange(
        {
          form: {
            state: 'filling',
            fields: { url: '' },
            error: '',
          },
          feeds: [],
          posts: [],
        },
        render(elements, i18nInstance),
      );

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        state.form.error = '';

        const getUrlsList = state.feeds.map(({ link }) => link);
        const schema = string().url().notOneOf(getUrlsList);

        schema
          .validate(state.form.fields.url)
          .then(() => {
            state.form.state = 'sending';
            return getHttpContents(state.form.fields.url);
          })
          .then((contents) => {
            const xmlDocument = domParser.parseFromString(contents, 'text/xml');
            return parseRSS(xmlDocument);
          })
          .then((parsedRSS) => {
            const feedId = state.feeds.length;

            const feed = {
              id: feedId,
              title: parsedRSS.title,
              description: parsedRSS.description,
              link: state.form.fields.url,
            };
            state.feeds.push(feed);

            const startPostId = state.posts.length;
            const posts = parsedRSS.items.map((item, i) => ({
              feedId,
              id: startPostId + i,
              ...item,
            }));
            state.posts = state.posts.concat(posts);

            state.form.fields.url = '';
          })
          .catch((error) => {
            console.log(error);
            const message = error.message ?? 'default';
            state.form.error = message;
          })
          .finally(() => {
            state.form.state = 'filling';
          });
      });

      elements.urlInput.addEventListener('change', (e) => {
        state.form.fields.url = e.target.value.trim();
      });

      elements.exampleUrl.addEventListener('click', (e) => {
        e.preventDefault();
        state.form.fields.url = e.target.innerHTML;
      });
    });
};
