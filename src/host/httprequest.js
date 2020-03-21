/* eslint-disable */
const req = require('request-promise');
const { ipcRenderer } = require('electron');
const axios = require('axios');

const HTTPRequest = {
  fileDownloads: {},

  /**
   * Downloads a file to a destination on disk
   * @param {string} url - Where to Download From
   * @param {string} dest - The Destination of the download
   * @param {function} onProgress - Called when progress occurs during download
   */
  download(url, dest, onProgress) {
    return new Promise(resolve => {
      const id = `${url}-${dest}`;
      this.fileDownloads[id] = {
        onProgress,
        onFinish: resolve
      };
      ipcRenderer.send('download-file', url, dest, id);
    });
  },

  /**
   * Download progress occurs
   * @param {object} download - The Download Object
   */
  fileDownloadProgress(download) {
    if (this.fileDownloads[download.id]) {
      this.fileDownloads[download.id].onProgress(download.progress);
    }
  },

  /**
   * A file has finished downloading
   * @param {object} download - The Download Object
   */
  fileDownloadFinish(download) {
    if (this.fileDownloads[download.id]) {
      this.fileDownloads[download.id].onFinish();
    }
  },

  /**
   * Performs an HTTP GET request to the specified URL
   * @param {string} url - The URL to perform the GET request
   * @param {string} querystring - Query String
   */
  async get(url, querystring) {
    return axios.get(url, {
      params: querystring,
      headers: {
        'X-Client': 'MinecraftManager'
      },
      timeout: 15000
    });
  },

  /**
   * Performs an HTTP POST request to the specified URL with a JSON body
   * @param {string} url - The URL to perform the POST request
   * @param {object} body - The POST parameters in a JSON object
   */
  async post(url, body) {
    return axios.post(url, body, {
      headers: {
        'X-Client': 'MinecraftManager'
      }
    });
  }
};

export default HTTPRequest;
