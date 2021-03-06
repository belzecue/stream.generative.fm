'use strict';

const { app, BrowserWindow } = require('electron');
const ipc = require('node-ipc');

ipc.config.id = 'stream.generative.fm.electron.main';
ipc.config.retry = 1500;
ipc.config.silent = true;

const renderers = {};
let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false, width: 0, height: 0 });
  ipc.connectTo('stream.generative.fm.express', () => {
    ipc.of['stream.generative.fm.express'].on('start-render', pieceId => {
      if (typeof renderers[pieceId] === 'undefined') {
        const renderer = new BrowserWindow({
          show: false,
          width: 0,
          height: 0,
          webPreferences: {
            nodeIntegration: true,
          },
        });
        renderer.pieceId = pieceId;
        renderer.loadFile('./index.html');
        renderers[pieceId] = renderer;
      }
    });

    ipc.of['stream.generative.fm.express'].on('stop-render', pieceId => {
      if (typeof renderers[pieceId] !== 'undefined') {
        renderers[pieceId].close();
        delete renderers[pieceId];
      }
    });
  });
});
