import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import ru from './text.js';
import render from './view.js';

const schema = yup.object({
  url: yup.string().required().url(),
});

const validate = (url) => schema.validate({ url })
  .then(() => ({ valid: true }))
  .catch(() => ({ valid: false }));

const initialState = {
  process: 'filling', // error, success
  error: '', // invalid, exists, noRSS, unknownError
  feeds: [],
  posts: [],
};

const elements = {
  form: document.querySelector('form'),
  input: document.querySelector('#url-input'),
  feedback: document.querySelector('.feedback'),
};

const state = onChange(initialState, render(elements, initialState, i18next));

const parseRSS = (rssContent) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rssContent, 'text/xml');

  try {
    const channel = doc.querySelector('channel');
    const feed = {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
    };

    const items = channel.querySelectorAll('item');
    const posts = Array.from(items).map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

    return { feed, posts };
  } catch (e) {
    state.error = 'noRSS';
    state.process = 'error';
    throw new Error(i18next.t(state.error));
  }
};

export default () => i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru,
  },
})
  .then(() => {
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      const isExists = (currentUrl) => state.feeds.includes(currentUrl);
      validate(url)
        .then((result) => {
          if (!result.valid) {
            state.error = 'invalid';
            state.process = 'error';
            throw new Error(i18next.t(state.error));
          }
          if (isExists(url)) {
            state.error = 'exists';
            state.process = 'error';
            throw new Error(i18next.t(state.error));
          }
        })
        .then(() => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${url}`))
        .then((result) => {
          console.log(parseRSS(result.data.contents));
          state.error = '';
          state.process = 'success';
          state.feeds.push(url);
        })
        .catch((error) => {
          console.log('Error:', error.message);
        });
    });
  })
  .catch((error) => {
    console.log('initialization error:', error.message);
  });
