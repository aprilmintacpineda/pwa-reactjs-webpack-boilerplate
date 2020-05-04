/** @format */

import { store } from 'fluxible-js';

export async function xhr (url, options) {
  let response;
  const headers = {};
  if (store.token) headers.Authorization = store.token;

  if (!options) {
    response = await fetch(url, { headers });
  } else {
    headers['content-type'] = 'application/json';
    response = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(options.body)
    });
  }

  if (response.status !== 200) throw response;
  return response;
}

export async function xhrWithFile (url, options) {
  const body = new FormData();

  Object.keys(options.body).forEach(key => {
    const value = options.body[key];

    if (value.constructor === FileList)
      for (let a = 0, maxA = value.length; a < maxA; a++) body.append(key, value[a]);
    else body.append(key, value);
  });

  const headers = {};
  if (store.token) headers.Authorization = store.token;

  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers,
    body
  });

  if (response.status !== 200) throw response;
  return response;
}
