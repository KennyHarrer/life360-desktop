// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('life360', {
    getCircleMembersLocation: async (circleID) => {
        return await ipcRenderer.invoke('getCircleMembersLocation', circleID);
    },
    getCircleMembers: async (circleID) => {
        return await ipcRenderer.invoke('getCircleMembers', circleID);
    },
    getCirclePlaces: async (circleID) => {
        return await ipcRenderer.invoke('getCirclePlaces', circleID);
    },
    getCircles: async () => {
        return await ipcRenderer.invoke('getCircles');
    },
    login: async (username, password) => {
        return await ipcRenderer.invoke('login', username, password);
    },
    isLoggedIn: async () => {
        return await ipcRenderer.invoke('isLoggedIn');
    },
});

contextBridge.exposeInMainWorld('app', {
    changePage: async (page) => {
        return await ipcRenderer.invoke('changePage', page);
    },
});
