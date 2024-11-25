# Symbols Assignment

## How to run the CLI file

### Globally
1. Install the package globally into your system
```
npm install -g .
```

2. Now you can user anywhere:
```
create-symbols-grid -x 10 -y 8 -d ./my-project
```

### Without installing

1. Run `yarn` to install `commander` package
2. Make the file executable `chmod +x cli.js`
3. Run the script: `./cli.js -x 10 -y 8 -d ./grid-selector`

It will clone the "starter-kit" repo and make changes to apply the Grid Selector

## Problems faced

### To render something based on props
Mainly using loops, I had a bug on clicking the tile, the first click works, but the next ones doesn't.

1. $collection on CellGrid
It worked visualy, but on click there is a strange error, probably on the rerender flow 
![image](https://github.com/user-attachments/assets/4ab0da7b-d13f-4a48-a280-99506c277813)

2. children on CellGrid
Do not work, children property render a div and the childExtend setting attaches to it, not reproducing any click handler.
![image](https://github.com/user-attachments/assets/279cd713-ec19-45c6-81ab-40002cf2fa8b)

3. `on stateInit` of GridSelector [current]
Was the best result, the buttons rendered and the first click works, but the next ones the `state` do not reproduces any changes in DOM. The click handler works and the data is changed.

### To use local fonts and images
Since there isn't a public folder, it kinda block to use assets freely. Symbols have the possibility to upload the image

