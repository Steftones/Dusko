# Dusko

An app creating a low poly cityscape scene with generative music. It runs SuperCollider code in the browser, generates sound procedurally and syncs the sound with visual animations.

```
npm install
npm run dev
```

The SuperCollider WebAssembly `.wasm` binaries have been taken from supercollider.dennis-scheiba.com. These modules run in the browser and everything that would normally be OSC communication between an `sclang`process and a `scsynth` process is instead facilitated through JS callbacks.
