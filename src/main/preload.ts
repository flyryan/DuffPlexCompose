import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI',
  {
    saveFile: async (content: string) => {
      try {
        return await ipcRenderer.invoke('save-file', content);
      } catch (error) {
        console.error('Error saving file:', error);
        throw error;
      }
    },
    selectDirectory: async () => {
      try {
        return await ipcRenderer.invoke('select-directory');
      } catch (error) {
        console.error('Error selecting directory:', error);
        throw error;
      }
    }
  }
);

// TypeScript declarations
declare global {
  interface Window {
    electronAPI: {
      saveFile: (content: string) => Promise<string>;
      selectDirectory: () => Promise<string | undefined>;
    };
  }
}
