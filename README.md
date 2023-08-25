# osu-imagemap-maker

This is a tool used to easily generate BBCode image maps for osu! pages.

## Getting Started for Development

The webapp is written in Typescript, Vite, and React. Ensure you have NodeJS installed.

### Installation

1. Clone the repo
```
git clone https://github.com/stkjoe/osu-imagemap-maker.git
```

2. Install NPM packages
```
npm install 
```

3. Start the development environment
```
npm run dev
```

## Known bugs
- Resizing a link area from the top side will cause the link area to shrink slightly more.
- Resizing a link area from the left side will cause the link area to shrink slightly more.

## Future improvements
- Add snapping feature for link area resizes
- Add alignment feature for link area drags
- Load existing imagemap from osu!BBCode
- Ability to sort link area layers (low priority)