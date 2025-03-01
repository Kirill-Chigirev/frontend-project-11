import * as yup from 'yup';

const schema = yup.object({
  website: yup.string().required().url(),
});

const validate = (url) => schema.validate({ website: url })
  .then(() => ({ valid: true }))
  .catch(() => ({ valid: false }));

export default () => {
  const state = {
    // eslint-disable-next-line no-undef
    currentUrlValidation,
    feeds: [],
    posts: [],
  };

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();
    const isExists = (currentUrl) => state.feeds.includes(currentUrl);
    validate(url)
      .then((result) => {
        state.currentUrlValidation = result.valid;
        if (result.valid && !isExists) {
          state.feeds.push(url);
        }
      });
  });
};
