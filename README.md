# Bones

## Intro

## Development

## Building from source

In order to build from source Node.js runtime is required in at least version 20 with npm 10.1.0. After cloning repo install all dependencies. In application source folder run:

```bash
HUSKY=0 npm ci
```

Then run build command:

```bash
npm run package
```

Build package will be available in `./out/Bones-{YOUR_PLATFORM}-x64`

While in `./out/Bones-{YOUR_PLATFORM}-x64` folder run `./bones` to open the application.

## SVG Background Requirements

In order to show and work correctly svg background have to meet several conditions:

- Have to contain outline of each bone constructed using closed path
- Each closed path has to have unique id equal to bone name, in case of multiple views of the same bone add view prefix or sufix
- Other not closed paths are treated as additional information, not used in surface calculation and so on
- Layers or groups are not allowed, there could only be one layer

## Usage tips

To zoom, move your mouse while holding Shift + LMB
