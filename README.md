flipstate devtool
=================

View and edit the state of a [flipstate](https://github.com/concept-not-found/flipstate) application.

###[Try demo](https://concept-not-found.github.io/flipstate-devtool/iframe/https%3A%2F%2Fconcept-not-found.github.io%2Fflipstate-samples%2Fcomposed-state%2F)

Setup
-----

The flipstate in your application must have devtools enabled.

### CDN
#### React
```html
<script src="https://unpkg.com/flipstate@1.2.0/dist/flipstate.dev.js"></script>
```
#### Preact
```html
<script src="https://unpkg.com/flipstate@1.2.0/dist/flipstate.preact.dev.js"></script>
```

### Node.js
Just ensure `process.env.NODE_ENV` is **not** `production`. Setting it to `production` will disable devtools and strip out the devtool with deadcode elimination minifiers.
#### React
```js
import createState from 'flipstate'
```
#### Preact
```js
import createState from 'flipstate/preact'
```
