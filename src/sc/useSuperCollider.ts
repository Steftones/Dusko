import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { loadScLang, loadScSynth, type ScLangModule, type ScSynthModule } from "./scWasm";
import { parseFlashLine, type SceneHandle } from "./flash";

export interface SuperColliderRefs {
  scene: RefObject<SceneHandle>;
}

const waitFor = (test: () => boolean): Promise<void> => {
  return new Promise((resolve) => {
    const poll = (): void => {
      if (test()) resolve();
      else setTimeout(poll, 20);
    };
    poll();
  });
};

export const useSuperCollider = (refs: SuperColliderRefs) => {
  const [status, setStatus] = useState("Click to start audio…");
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);

  const scsynthRef = useRef<ScSynthModule | null>(null);
  const sclangRef = useRef<ScLangModule | null>(null);
  const audioDriverReady = useRef(false);
  const pendingOsc = useRef<Uint8Array[]>([]);
  const interpreterReady = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("Loading scsynth + sclang…");
      const [scsynth, sclang] = await Promise.all([loadScSynth(), loadScLang()]);
      if (cancelled) return;
      scsynthRef.current = scsynth;
      sclangRef.current = sclang;

      const sendToScsynth = (bytes: Uint8Array) => {
        if (audioDriverReady.current) scsynth.sendOsc(bytes);
        else pendingOsc.current.push(bytes);
      };
      scsynth.onStdout = (line) => {
        console.log("[scsynth]", line);
        if (line.includes("SC_AudioDriver")) {
          audioDriverReady.current = true;
          pendingOsc.current.splice(0).forEach((bytes) => scsynth.sendOsc(bytes));
          audioContextRef.current = scsynth.getAudioContext?.() ?? null;
        }
      };
      scsynth.onOscReply = (oscReply) => sclang.sendOsc(oscReply);
      sclang.onOsc = (osc) => sendToScsynth(new Uint8Array(osc));

      (window as unknown as { bootServer: (opts: Record<string, unknown>) => void }).bootServer = (opts) => {
        console.log("[bootServer]", opts);
        scsynth.boot(opts);
      };

      sclang.printCallback = (line) => {
        const flash = parseFlashLine(line);
        if (flash) {
          refs.scene.current?.flash(flash.name, flash.duration);
        } else if (line.includes("CONTROLS_READY")) {
          setControlsReady(true);
          setStatus("Playing");
        } else {
          console.log("[sclang]", line);
        }
        if (line.includes("compile done")) {
          interpreterReady.current = true;
          setStatus("Ready. Click Play");
        }
      };
      sclang.bootInterpreter();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const playDemo = useCallback(() => {
    setStatus("Waiting for sclang…");
    setControlsReady(false);
    void waitFor(() => interpreterReady.current).then(async () => {
      setStatus("Loading...");
      const code = await (await fetch(`${import.meta.env.BASE_URL}demo.scd`)).text();
      sclangRef.current?.runCode(code);
      setIsPlaying(true);
    });
  }, []);

  const stopAll = useCallback(() => {
    void waitFor(() => interpreterReady.current).then(() => {
      sclangRef.current?.runCode("CmdPeriod.run;");
      setStatus("Stopped");
      setIsPlaying(false);
      setControlsReady(false);
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopAll();
    else playDemo();
  }, [isPlaying, playDemo, stopAll]);

  const setTempo = useCallback((bpm: number) => {
    sclangRef.current?.runCode(`~setTempo.(${bpm});`);
  }, []);

  const setVolume = useCallback((amp: number) => {
    sclangRef.current?.runCode(`~setVolume.(${amp});`);
  }, []);

  const setMusicMode = useCallback((t: number) => {
    sclangRef.current?.runCode(`~setMusicMode.(${t});`);
  }, []);

  return { status, isPlaying, togglePlay, setTempo, setVolume, setMusicMode, controlsReady };
};
