# pwa-reactjs-webpack-boilerplate

A boilerplate for your **Progressive Web App (PWA)** with **react-js**, **material-ui**, **fluxible-js**, and **react-fluxible** using **webpack**.

# Setting up

## Install

- `git clone git@github.com:aprilmintacpineda/pwa-reactjs-webpack-boilerplate.git`
- Rename folder to `<your_project>` -- `mv pwa-reactjs-webpack-boilerplate <your_project>`
- `cd <your_project>`
- Delete the `.git` directory because you won't need it -- `rm -rf .git`
- `npm i` -- Optionally you can use **npm-check** and do `npm-check -u` to update and install the dependencies.

## favicons

You can use [favicon-generator.org](https://www.favicon-generator.org/) to generate the images you'll need for the favicon. Replace the `assets/images/favicon.icon` with the generated one and replace the matching file names on `/assets/images/icons`.

## Manifest icons

For the manifest icons and the `manifest.json`, you can use [Manifest generator](https://app-manifest.firebaseapp.com/). After downloading the zip file, replace all images in `/assets/images/manifest-icons` with the images from `images/icons` included in the zip file.

Edit the `manifest.json` file and change the `name`, `short_name`, etc., but you don't need to change the `icons`

# Development

All JS files are in `src` folder, start by going to `src/entry.js` which is the main entry point for webpack. To start development run `npm run dev` which will start up a dev-server and open up a window for you. Then you can make changes to the files in `src`, the opened window will automatically refresh when changes were made.

# Production

To build for production just do `npm run build`. It will generate a production build of your app in `build` directory, this directory is ready to be deployed to production. If you want to preview the production build, you can do so with `npm run serve`. Running `npm run start` will do both of these commands.

## Uploading to S3

The boilerplate supports uploading the build to an S3 bucket.

1. Create S3 bucket and enable static file hosting.
2. Rename `configs/uploadToS3.example.js` to `configs/uploadToS3.js` -- `mv configs/uploadToS3.example.js configs/uploadToS3.js`.
3. Create an IAM user with programmatic access to be used for the uploader, and get the `access key id` and `secret access key` and put those in the `configs/uploadToS3.js` files.
4. do `npm run build` and then `npm run uploadToS3` -- or you can also do `npm run deployToS3` which will do both.

The upload process will also delete old files after successful upload.

# Issues

Feel free to open an issue anytime.

# References

- [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps#Core_PWA_guides)
- [react-js](https://reactjs.org/)
- [material-ui](http://material-ui.com/)
- [webpack](https://webpack.js.org/)
- [NodeJS](https://nodejs.org/)
- [npm-check](https://www.npmjs.com/package/npm-check)
- [react-fluxible](https://github.com/aprilmintacpineda/react-fluxible)
- [fluxible-js](https://github.com/aprilmintacpineda/fluxible-js)

# Credits

- The default logo used in this template was made by [Freepik](https://www.flaticon.com/authors/freepik) from [flaticon.com](https://www.flaticon.com/).