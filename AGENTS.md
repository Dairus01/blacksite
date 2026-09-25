# PROJECT BLACKSITE development guide

The canonical game and deploy root is `game/`. Run it with `npm start`.

For gameplay or rendering changes, run focused unit tests, `npm test`, and
`npm run test:browser`. Inspect `artifacts/jam-acceptance/complete.png` and
`state.json`; browser console errors and missing resources are failures. Use
`window.game.debug` for safe deterministic inspection. Keep `window.__READY__`
and `window.__GAME__` truthful.

The game must remain an original procedural Three.js 404 entry. Do not add
imported map, weapon, player, or enemy models. Preserve the official gate and
ship tools. Generated evidence belongs under ignored artifact directories.
