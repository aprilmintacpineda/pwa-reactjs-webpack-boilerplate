/** @format */

import React from 'react';
import ReactDOM from 'react-dom';
import { initializeStore, emitEvent } from 'fluxible-js';

import CssBaseline from '@material-ui/core/CssBaseline';

import Main from './Main';
import registerServiceWorker from './registerServiceWorker';

if (process.env.NODE_ENV === 'production' && (!('Promise' in window) || !('fetch' in window))) {
  document.getElementById('app').innerHTML = `
    <h1>
      You are using an old, unsupported browser.
      For the best experience, download and install the latest version.
    </h1>
  `;
} else {
  // you can add polyfills here
  const polyfills = [];

  if (!('findIndex' in Array.prototype)) {
    polyfills.push(
      import(
        /* webpackChunkName: "array.findIndex" */
        'polyfills/array.findIndex'
      )
    );
  }

  if (!('includes' in Array.prototype)) {
    polyfills.push(
      import(
        /* webpackChunkName: "array.includes" */
        'polyfills/array.includes'
      )
    );
  }

  if (!('includes' in String.prototype)) {
    polyfills.push(
      import(
        /* webpackChunkName: "string.includes" */
        'polyfills/string.includes'
      )
    );
  }

  if (!('padStart' in String.prototype)) {
    polyfills.push(
      import(
        /* webpackChunkName: "string.padStart" */
        'polyfills/string.padStart'
      )
    );
  }

  Promise.all(polyfills).then(() => {
    // once all polyfills has loaded, we can initialize the application
    initializeStore({
      initialStore: {
        authUser: null
      },
      persist: {
        syncStorage: window.localStorage,
        restore: savedStore => ({
          authUser: savedStore.authUser || { name: 'April Mintac Pineda' }
        })
      }
    });

    ReactDOM.render(
      <>
        <CssBaseline />
        <Main />
      </>,
      document.getElementById('app')
    );

    registerServiceWorker({
      onUpdate: () => {
        emitEvent('newContentsAvailable');
      }
    });
  });
}
