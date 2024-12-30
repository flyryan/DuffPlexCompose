import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

async function findAvailablePort(startPort: number): Promise<number> {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html from a url in development
  // or the local file in production.
  if (isDev) {
    // Try ports 3000-3010
    const port = await findAvailablePort(3000);
    try {
      await mainWindow.loadURL(`http://localhost:${port}`);
      mainWindow.webContents.openDevTools();
    } catch (err) {
      console.error('Failed to load dev server:', err);
      // Fallback to production build if dev server is not available
      mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

// Handle saving docker-compose.yml file
ipcMain.handle('save-file', async (_, content: string) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow!, {
      title: 'Save docker-compose.yml',
      defaultPath: path.join(app.getPath('documents'), 'docker-compose.yml'),
      filters: [
        { name: 'YAML', extensions: ['yml', 'yaml'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePath) {
      await fs.writeFile(filePath, content, 'utf-8');
      return filePath;
    }
    return '';
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
});

// Handle directory selection
ipcMain.handle('select-directory', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Directory'
    });

    return filePaths[0];
  } catch (error) {
    console.error('Error selecting directory:', error);
    throw error;
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
