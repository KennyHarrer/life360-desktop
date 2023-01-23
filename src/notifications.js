const { ipcMain, BrowserWindow, screen } = require('electron');
const path = require('path');

let padding = 20;

ipcMain.handle('createNotification', (event, title, description) => {
    let notificationWidth = 350;
    let notificationHeight = 100;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const window = new BrowserWindow({
        width: notificationWidth,
        height: notificationHeight,
        x: width - notificationWidth - padding,
        y: height - notificationHeight - padding,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    window.setAlwaysOnTop(true, 'floating');
    window.moveTop();
    window.loadURL(
        'file://' +
            path.join(
                __dirname,
                'notification',
                'index.html?title=' + title + '&description=' + description
            )
    );
});
