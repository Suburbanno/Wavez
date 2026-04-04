# Wavez Tools

Script modular para injetar um menu `Tools` nas salas do WavezFM usando `window.WavezFM`.

## Bookmarklet

```js
javascript:(()=>{const src="https://cdn.jsdelivr.net/gh/Suburbanno/WavezTools@main/dist/wavez-tools.js";const id="wavez-tools-loader";document.getElementById(id)?.remove();const script=document.createElement("script");script.id=id;script.src=src+"?t="+Date.now();script.onload=()=>console.log("[Wavez Tools] loader ok");script.onerror=()=>console.error("[Wavez Tools] falha ao carregar o bundle remoto.");document.head.appendChild(script);})();
```

## Como editar

1. Altere os arquivos em `src/`
2. Rode `npm run build`
3. Rode `npm run check`
