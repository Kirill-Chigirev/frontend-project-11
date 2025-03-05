/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import ru from './locales/ru.js';
import render from './view.js';
import view from './view.js';

const schema = yup.object({
  url: yup.string().required().url(),
});

const validate = (url) => schema.validate({ url })
  .then(() => ({ valid: true }))
  .catch(() => ({ valid: false }));

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

const getRSS = (url, state) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`)
  .then((response) => parseRSS(response.data.contents))
  .then((result) => {
    if (!state.sources.includes(url)) {
      state.error = '';
      state.process = 'success';
      state.sources = [url, ...state.sources];
      state.feeds = [result.feed, ...state.feeds];
      state.posts = [...result.posts, ...state.posts];
    } else {
      const newPosts = [];
      result.posts.forEach((post) => {
        const oldPost = state.posts.find(({ title }) => title === post.title);
        if (!oldPost) {
          newPosts.push(post);
        }
      });
      state.posts = [...newPosts, ...state.posts];
    }
  })
  .catch((e) => {
    state.error = e.message === 'noRSS' ? 'noRSS' : 'networkError';
    state.process = 'error';
  });

export default () => {
  const initialState = {
    process: 'filling', // error, success
    error: '', // invalid, exists, noRSS, networkError, unknownError
    sources: [],
    feeds: [],
    posts: [],
    viewedPosts: [],
  };

  const modalFooter = document.querySelector('.modal-footer');

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalButton: modalFooter.querySelector('a'),
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
        const isExists = (currentUrl) => state.feeds.includes(currentUrl);
        validate(url)
          .then((result) => {
            if (!result.valid) {
              state.error = 'invalid';
              throw new Error(i18next.t(state.error));
            }
            if (isExists(url)) {
              state.error = 'exists';
              throw new Error(i18next.t(state.error));
            }
          })
          .then(() => {
            getRSS(url, state);
          })
          .catch(() => {
            state.process = 'error';
          });
      });

      const checkNewPosts = () => {
        state.sources.forEach((source) => {
          getRSS(source, state);
        });
        setTimeout(checkNewPosts, 5000);
      };
      setTimeout(checkNewPosts, 5000);

      elements.posts.addEventListener('click', ({ target }) => {
        if (target.dataset.id) {
          const filteredPosts = state.viewedPosts.filter((id) => id !== target.dataset.id);
          state.viewedPosts = [...filteredPosts];
          state.viewedPosts = [...state.viewedPosts, target.dataset.id];
        }
      });
    })
    .catch((error) => {
      console.log('initialization error:', error.message);
    });
};
