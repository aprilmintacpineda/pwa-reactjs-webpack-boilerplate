/** @format */

// configurations

// add filenames that you don't want to upload to S3
const filesToIgnore = ['.DS_Store'];

const aws = require('aws-sdk');
const { promisify } = require('util');
const recursiveReadDir = require('recursive-readdir');
const config = require('../configs/uploadToS3');
const argv = require('process.argv')(process.argv.slice(2));

const { env } = argv({ env: 'dev' });

if (!(env in config))
  throw new Error(`Target env configuration, "${env}", was not found in "configs/uploadToS3".`);

const { bucket, accessKeyId, secretAccessKey } = config[env];

if (!accessKeyId || !secretAccessKey)
  throw new Error(`Please specify "accessKeyId" and "secretAccessKey" for env ${env}.`);

const path = require('path');
const fs = require('fs');
const spinner = require('ora')();
const { gzip } = require('node-gzip');
const mime = require('mime-types');
const isImage = require('is-image');

const rootDir = process.cwd();
const recursiveReadDirAsync = promisify(recursiveReadDir);

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
  accessKeyId,
  secretAccessKey
});

async function uploadFileToS3 (fileAbsolutePath, fileRelativePath) {
  const params = {
    Bucket: bucket,
    Key: fileRelativePath,
    Body: await fs.promises.readFile(fileAbsolutePath),
    ContentType: mime.lookup(fileAbsolutePath)
  };

  if (!isImage(fileAbsolutePath)) {
    params.Body = await gzip(params.Body);
    params.ContentEncoding = 'gzip';
  }

  await new Promise((resolve, reject) => {
    s3.upload(params, error => {
      if (error) reject(error);
      else resolve(error);
    });
  });
}

const uploadResources = {};
const uploadProcess = {
  getCurrentObjectsList: () => {
    spinner.start('Getting list of objects to be deleted after successful upload');

    return new Promise((resolve, reject) => {
      s3.listObjectsV2({ Bucket: bucket }, (error, data) => {
        if (error) {
          reject(error);
        } else {
          uploadResources.objectKeysToRemove = data.Contents.map(object => object.Key).filter(
            key => {
              const filePath = path.join(rootDir, 'build', key);
              if (fs.existsSync(filePath)) return !fs.statSync(filePath).isDirectory();
              return true;
            }
          );

          resolve();
        }
      });
    });
  },
  getFilesToUpload: async () => {
    spinner.start('Getting files to upload');

    const buildPath = path.join(rootDir, 'build');
    const stripLen = buildPath.length + 1;
    const absolutePaths = await recursiveReadDirAsync(buildPath, filesToIgnore);

    // relativePaths is relative to build as the root
    // it will be used as the `Key` when uploading
    uploadResources.filesToUpload = {
      absolutePaths,
      relativePaths: absolutePaths.map(absolutePath => absolutePath.substr(stripLen))
    };
  },
  filterFilesToRemove: () => {
    spinner.start('Filtering files to remove');

    // If the file key already exist, it will be replaced instead
    // so we don't want to delete that file, we just want to delete
    // files that will no longer be used.
    uploadResources.objectKeysToRemove = uploadResources.objectKeysToRemove.filter(
      objectKey => !uploadResources.filesToUpload.relativePaths.includes(objectKey)
    );
  },
  uploadFilesToS3: async () => {
    const promises = [];
    const maxA = uploadResources.filesToUpload.absolutePaths.length;

    spinner.start(`Uploading ${maxA} files to s3`);

    for (let a = 0; a < maxA; a++) {
      promises.push(
        uploadFileToS3(
          uploadResources.filesToUpload.absolutePaths[a],
          uploadResources.filesToUpload.relativePaths[a]
        )
      );
    }

    await Promise.all(promises);
  },
  deleteOldObjects: () => {
    const objects = uploadResources.objectKeysToRemove.map(Key => ({ Key }));
    const numFiles = objects.length;

    spinner.start(`Deleting ${numFiles} files from s3`);

    if (!numFiles) return;

    return new Promise((resolve, reject) => {
      s3.deleteObjects(
        {
          Bucket: bucket,
          Delete: { Objects: objects }
        },
        error => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
};

async function uploadToS3 () {
  try {
    const functionsKeys = Object.keys(uploadProcess);

    for (let a = 0, maxA = functionsKeys.length; a < maxA; a++) {
      await uploadProcess[functionsKeys[a]]();
      spinner.succeed();
    }
  } catch (error) {
    spinner.fail();
    console.error(error);
  }
}

uploadToS3();
