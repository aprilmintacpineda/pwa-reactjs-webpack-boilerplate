/** @format */

export default config => {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.ready.then(() => {
        // eslint-disable-next-line
        console.log('This web app is being served by a service');
      });

      navigator.serviceWorker
        .register('/service-worker.js')
        .then(registration => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('New content is available'); // eslint-disable-line
                  // Execute callback
                  if (config && config.onUpdate) config.onUpdate(registration);
                } else {
                  // eslint-disable-next-line
                  console.log('Content is cached for offline use.');

                  // Execute callback
                  if (config && config.onSuccess) config.onSuccess(registration);
                }
              }
            };
          };
        })
        .catch(error => {
          // eslint-disable-next-line
          console.error('Error during service worker registration:', error);
        });
    });
  }
};
