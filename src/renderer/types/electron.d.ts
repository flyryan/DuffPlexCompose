export {};

declare global {
  interface Window {
    electronAPI: {
      saveFile: (content: string) => Promise<string>;
      selectDirectory: () => Promise<string | undefined>;
    };
  }
}
