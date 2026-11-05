# Dusko

An app creating a low poly cityscape scene with generative music. It runs SuperCollider code in the browser, generates sound procedurally and syncs the sound with visual animations.

Live link: https://dusko-tan.vercel.app/

```
npm install
npm run dev
```

The SuperCollider WebAssembly `.wasm` binaries have been taken from supercollider.dennis-scheiba.com. These modules run in the browser and everything that would normally be OSC communication is instead facilitated through JS callbacks.

Also, thanks to https://nathanho.me/ for inspiration in terms of the sound synthesis programming.
