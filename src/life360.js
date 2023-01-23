const { ipcMain } = require('electron');

const { Life360Handler } = require('life360-api.js');

let life360;

function isLoggedIn() {
    return life360 && life360.isLoggedIn();
}

ipcMain.handle('getCircleMembersLocation', async (event, circleID) => {
    if (!isLoggedIn()) return { error: 'not logged in' };
    return await life360.getCircleMembersLocation(circleID);
});

ipcMain.handle('getCircleMembers', async (event, circleID) => {
    if (!isLoggedIn()) return { error: 'not logged in' };
    return await life360.getCircleMembers(circleID);
});
ipcMain.handle('getCirclePlaces', async (event, circleID) => {
    if (!isLoggedIn()) return { error: 'not logged in' };
    return await life360.getCirclePlaces(circleID);
});
ipcMain.handle('getCircles', async () => {
    if (!isLoggedIn()) return { error: 'not logged in' };
    return await life360.getCircles();
});
ipcMain.handle('login', async (event, username, password) => {
    if (isLoggedIn()) {
        return;
    }
    life360 = new Life360Handler(username, password);

    return await life360
        .login()
        .catch((error) => {
            return { error: error };
        })
        .then((session) => {
            return session;
        });
});
ipcMain.handle('isLoggedIn', () => {
    return isLoggedIn();
});
