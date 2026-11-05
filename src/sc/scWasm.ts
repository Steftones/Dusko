export interface ScSynthModule {
  boot(opts: Record<string, unknown>): void;
  sendOsc(bytes: Uint8Array): void;
  onStdout: (line: string) => void;
  onOscReply: (oscReply: ArrayLike<number>) => void;
  getAudioContext?(): AudioContext;
}

export interface ScLangModule {
  bootInterpreter(): void;
  runCode(code: string): void;
  sendOsc(oscReply: ArrayLike<number>): void;
  onOsc: (osc: ArrayLike<number>) => void;
  printCallback: (line: string) => void;
}

type ModuleFactory<T> = (opts: { locateFile: (path: string) => string }) => Promise<T>;

const locateFile = (path: string) => `${import.meta.env.BASE_URL}${path}`;

const loadPublicModule = (url: string): Promise<{ default: unknown }> => {
  return new Promise((resolve, reject) => {
    const callbackName = `__loadPublicModule_${Math.random().toString(36).slice(2)}`;
    (window as unknown as Record<string, unknown>)[callbackName] = (mod: { default: unknown }) => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve(mod);
    };
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `import * as mod from ${JSON.stringify(url)}; window.${callbackName}(mod);`;
    script.onerror = reject;
    document.head.appendChild(script);
    script.remove();
  });
};

export const loadScSynth = async (): Promise<ScSynthModule> => {
  const { default: ScSynth } = await loadPublicModule(`${import.meta.env.BASE_URL}scsynth.js`);
  return (ScSynth as ModuleFactory<ScSynthModule>)({ locateFile });
};

export const loadScLang = async (): Promise<ScLangModule> => {
  const { default: ScLang } = await loadPublicModule(`${import.meta.env.BASE_URL}sclang.js`);
  return (ScLang as ModuleFactory<ScLangModule>)({ locateFile });
};
