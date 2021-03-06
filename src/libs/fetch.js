/** @format */

import { store } from 'fluxible-js';

import FileCollection from 'classes/FileCollection';

function resolveUrl (url = '') {
  let finalUrl = '';

  try {
    // valid custom url
    finalUrl = new URL(url).toString();
  } catch (error) {
    // it's a shorthand url like /user/login
    if (url[0] !== '/') finalUrl = `${process.env.API_URL}/${url}`;
    finalUrl = `${process.env.API_URL}${url}`;
  }

  return finalUrl;
}

export async function xhr (url, options) {
  let response;
  const headers = {};
  if (store.token) headers.Authorization = store.token;

  if (!options) {
    response = await fetch(resolveUrl(url), { headers });
  } else {
    headers['content-type'] = 'application/json';
    response = await fetch(resolveUrl(url), {
      ...options,
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(options.body)
    });
  }

  if (response.status > 299 || response.status < 200) throw response;
  return response;
}

export async function xhrWithFile (url, options) {
  const body = new FormData();

  Object.keys(options.body).forEach(key => {
    const value = options.body[key];
    const valConstructor = value.constructor;

    if (valConstructor === FileCollection) {
      value.files.forEach(val => {
        body.append(key, val);
      });
    } else {
      body.append(key, JSON.stringify(value));
    }
  });

  const headers = {};
  if (store.token) headers.Authorization = store.token;

  const response = await fetch(resolveUrl(url), {
    ...options,
    credentials: 'same-origin',
    headers,
    body
  });

  if (response.status !== 200) throw response;
  return response;
}
