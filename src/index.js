/* eslint-disable no-console */
import 'react-hot-loader/patch';
import React from 'react';
import ReactDOM from 'react-dom';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import App from './app';
import ProfilesManager from './manager/profilesManager';
import Global from './util/global';
import SettingsManager from './manager/settingsManager';
import HTTPRequest from './host/httprequest';
import ToastManager from './manager/toastManager';
import ErrorManager from './manager/errorManager';
import LibrariesManager from './manager/librariesManager';
import './font/fonts.css';
import { loadLatestProfile } from './defaultProfiles/latestProfile';
import { loadSnapshotProfile } from './defaultProfiles/snapshotProfile';
import logInit from './util/logger';
import FSU from './util/fsu';
import dropdownArrow from './component/customdropdown/img/arrow.png';
import theemeraldtreeLogo from './page/settings/img/theemeraldtree-logo.png';

const logger = logInit('index');

const { remote, ipcRenderer } = require('electron');

localStorage.setItem('importDone', 'false');

async function load() {
  logger.info('Loading React app...');

  logger.info('Loading settings...');
  await SettingsManager.loadSettings();
  logger.info('Done loading settings');

  try {
    logger.info('Attempting to update MC versions...');
    Global.updateMCVersions();

    if (fs.existsSync(Global.PROFILES_PATH)) {
      // Check for directories - we need to make sure everything exists
      logger.info('Checking for missing essential library directories...');

      FSU.createDirIfMissing(path.join(Global.getMCPath(), '/libraries/minecraftmanager'));
      FSU.createDirIfMissing(path.join(Global.getMCPath(), '/libraries/minecraftmanager/profiles'));
    }
  } catch (e) {
    logger.error('Something went wrong');
    logger.error(e.toString());
    ToastManager.createToast('ERROR', ErrorManager.makeReadable(e));
  }

  if (fs.existsSync(Global.PROFILES_PATH)) {
    logger.info('Attempting to load default profiles...');

    loadLatestProfile();
    loadSnapshotProfile();
  }

  logger.info('Loading profiles...');
  await ProfilesManager.getProfiles();

  document.addEventListener('keydown', e => {
    if (e.keyCode === 123) {
      remote.getCurrentWindow().webContents.toggleDevTools();
    }
  });

  ipcRenderer.on('file-download-progress', (event, progress) => {
    HTTPRequest.fileDownloadProgress(progress);
  });

  ipcRenderer.on('file-download-finish', (event, progress) => {
    HTTPRequest.fileDownloadFinish(progress);
  });

  ipcRenderer.on('file-download-error', (event, obj) => {
    logger.info(`Received FileDownloadError IPC, ${JSON.stringify(obj)}`);
    HTTPRequest.fileDownloadError(obj);
  });

  try {
    if (fs.existsSync(Global.PROFILES_PATH)) {
      logger.info('Resetting temporary directories...');
      // reset temp
      rimraf.sync(path.join(Global.MCM_TEMP));
      fs.mkdirSync(path.join(Global.MCM_TEMP));

      logger.info('Checking for libraries...');
      LibrariesManager.checkExist();

      logger.info('Checking for extra versions, profiles, and libraries...');
      Global.checkMinecraftVersions();
      Global.checkMinecraftProfiles();
      Global.checkMinecraftLibraries();

      if (SettingsManager.currentSettings.checkToastNews) {
        logger.info('Checking for Toast news...');
        Global.checkToastNews();
      }

      logger.info('Checking to show a changelog...');
      Global.checkChangelog();

      logger.info('Checking for migration...');
      // We call this function in order to see if any changes to OMAF or any other method have been made since the last version
      Global.checkMigration();

      logger.info('Scanning profiles...');
      Global.scanProfiles();

      ProfilesManager.updateReloadListeners();
    }
  } catch (e) {
    logger.error('Something went wrong[1]');
    logger.error(e.toString());
    ToastManager.createToast('ERROR', ErrorManager.makeReadable(e));
  }

  logger.info('Caching images...');
  Global.cacheImage(dropdownArrow);
  Global.cacheImage(theemeraldtreeLogo);

  // eslint-disable-next-line react/jsx-filename-extension
  ReactDOM.render(<App />, document.getElementById('app'));
}

if (module.hot) {
  module.hot.accept();
}

load();
