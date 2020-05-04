/** @format */

const validations = {
  required (value) {
    if (!value) return 'Required.';

    if (value.constructor === Array) {
      if (!value.length) return 'Required.';
    } else if (!value.toString().trim().length) {
      return 'Required.';
    }

    return '';
  },
  email (value) {
    // eslint-disable-next-line
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // From: https://emailregex.com/

    if (!emailRegex.test(value)) return 'Invalid.';
    if (value.length > 255) return 'We don\'t serve jerks in here.';
    return '';
  },
  date (value) {
    const date = new Date(value);
    if (date.toString() === 'Invalid Date') return 'Invalid.';
    return '';
  },
  gender (value) {
    if (value !== 'male' && value !== 'female') return 'Invalid.';
    return '';
  },
  maxLength (value, max) {
    if (value.length > parseFloat(max)) return `Must be less than ${max} characters.`;
    return '';
  }
};

// USAGE:
// import validate from 'libs/validations';
// const errors = validae(variable, ['required', 'maxLength:255']);
export default (value, rules) => {
  for (let a = 0, maxA = rules.length; a < maxA; a++) {
    const key = rules[a];
    let error = '';

    if (key.includes(':')) {
      const [rule, payload] = key.split(':');
      error = validations[rule](value, ...payload.split(','));
    } else {
      error = validations[key](value);
    }

    if (error) return error;
  }

  return '';
};
