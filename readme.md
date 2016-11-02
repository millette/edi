# Readme

Install it:
```
git clone https://github.com/millette/hapi-demo.git
cd hapi-demo
```

If you don't already have it, install yarn, an npm alternative:
```
npm install yarn -g
```

Why yarn? It's arguably faster than npm and deterministic. In other words,
two npm installs of the same package might not install the same files in
the same places, whereas yarn is designed to be reproducible.

If you're already familiar with npm, have a look at this
[yarn-npm cheat sheet](https://github.com/areai51/yarn-cheatsheet).

Install dependencies:
```
yarn
```

Start it for development, editing files will reload the server:
```
yarn run dev
```

Start it for production, templates are cached:
```
yarn start
```

Launch the browser:
```
firefox http://localhost:8090/
```

What other scripts are available?
```
yarn run
```

See the file ```package.json``` for each script implementation.

To run all tests, linters, etc.
```
yarn run test
```
