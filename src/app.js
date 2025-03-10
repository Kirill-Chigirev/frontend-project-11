/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import ru from './locales/ru.js';
import render from './view.js';

const schema = yup.object({
  url: yup.string().required().url(),
});

const validate = (url) => schema.validate({ url });

const parseRSS = (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'text/xml');

  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('noRSS');
  }

  const feed = {
    title: channel.querySelector('title').textContent,
    description: channel.querySelector('description').textContent,
  };

  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
    id: uniqueId(),
  }));

  return { feed, posts };
};

const errorMap = {
  noRSS: 'noRSS',
  'Network Error': 'networkError',
  exists: 'exists',
  'url must be a valid URL': 'invalid',
};

const getRSS = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`);

const ms = 5000;
const checkNewPosts = (state) => {
  state.sources.forEach((source) => {
    getRSS(source)
      .then((response) => parseRSS(response.data.contents))
      .then((result) => {
        const newPosts = [];
        result.posts.forEach((post) => {
          const oldPost = state.posts.find(({ title }) => title === post.title);
          if (!oldPost) {
            newPosts.push(post);
          }
        });
        state.posts = [...newPosts, ...state.posts];
      })
      .catch((error) => {
        console.error(error);
      });
  });
  setTimeout(checkNewPosts, ms, state);
};

export default () => {
  const initialState = {
    process: 'filling', // request, success, error
    error: '', // invalid, exists, noRSS, networkError, unknownError
    sources: [],
    feeds: [],
    posts: [],
    viewedPosts: [],
  };

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalButton: document.querySelector('.modal-footer a'),
  };

  return i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  })
    .then(() => {
      const state = onChange(initialState, render(elements, initialState, i18next));
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const isExists = (currentUrl) => state.sources.includes(currentUrl);
        validate(url)
          .then(() => {
            if (isExists(url)) {
              state.error = 'exists';
              throw new Error(i18next.t(state.error));
            }
          })
          .then(() => {
            state.process = 'request';
            getRSS(url)
              .then((response) => parseRSS(response.data.contents))
              .then((result) => {
                state.error = '';
                state.process = 'success';
                state.sources = [url, ...state.sources];
                state.feeds = [result.feed, ...state.feeds];
                state.posts = [...result.posts, ...state.posts];
              })
              .catch((error) => {
                state.error = errorMap[error.message] ? errorMap[error.message] : 'unknownError';
                state.process = 'error';
              });
          })
          .catch((error) => {
            state.error = errorMap[error.message];
            state.process = 'error';
          });
      });

      setTimeout(checkNewPosts, ms, state);

      elements.posts.addEventListener('click', ({ target }) => {
        if (target.dataset.id) {
          const filteredPosts = state.viewedPosts.filter((id) => id !== target.dataset.id);
          state.viewedPosts = [...filteredPosts, target.dataset.id];
        }
      });
    })
    .catch((error) => {
      console.error('initialization error:', error.message);
    });
};
