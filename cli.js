#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { program } = require("commander");
const { execSync } = require("child_process");

const gridSelectorTemplate = `
import { Button, Flex, Grid } from "smbls";

const getCellCoord = (key) => key.replace("cell", "").split(",");

const CellButton = {
  extend: Button,
  props: ({ key }, state) => {
    const [x, y] = getCellCoord(key);
    const isSelected = state.parent.selectedCells?.has(\`\${x},\${y}\`);

    return {
      width: "26px",
      height: "26px",
      borderRadius: "2px",
      padding: "0",
      display: "block",
      backgroundColor: isSelected ? "#3D7BD9" : "#E8F1FF",
    };
  },
};

const P = {
  tag: "p",
  props: {
    margin: "0px",
  },
};

const FooterText = {
  extend: P,
  props: {
    color: "#00000080",
  },
  text: ({ props }) => props.label,
  span: {
    props: {
      color: "#000000",
    },
    text: ({ parent: { props } }) => props.value,
  },
};

export const GridSelector = {
  extend: Flex,

  props: {
    rows: 8,
    columns: 16,
    flexDirection: "column",
    gap: "26px",
    backgroundColor: "white",
    color: "black",
    padding: "20px 26px",
    borderRadius: "26px",
    boxShadow: '0px 5px 35px -10px #00000059'
  },

  state: {
    selectedCells: new Set(),
  },

  Title: {
    tag: "h1",
    props: {
      fontSize: "A",
    },
    text: "Grid Selection",
  },

  CellGrid: {
    extend: Grid,
    props: ({ parent: { props } }) => {
      return {
        width: "auto",
        height: "auto",
        templateColumns: \`repeat(\${props.columns}, 1fr)\`,
        aspectRatio: \`\${props.columns}/\${props.rows}\`,
        gap: "4px",
        padding: "10px 6px",
        boxShadow: "0px 0px 50px 0px #0000000D",
      };
    },
    childExtend: {
      on: {
        click: (_event, element, state) => {
          const [x, y] = getCellCoord(element.key);
          const newSelection = new Set();
          for (let i = 0; i <= x; i++) {
            for (let j = 0; j <= y; j++) {
              newSelection.add(\`\${i},\${j}\`);
            }
          }
          state.parent.update({
            selectedCells: newSelection,
          });
        },
      },
    },
  },

  Footer: {
    extend: Flex,
    props: {
      justifyContent: "space-between",
      padding: 0,
      fontSize: "12px",
    },

    SelectedInfo: {
      extend: FooterText,
      props: {
        label: "Selection coordinates: ",
        value: (_el, state) => {
          if (!state.parent.selectedCells) return "None";
          const maxX = Math.max(
            ...Array.from(state.parent.selectedCells).map((coord) =>
              parseInt(coord.split(",")[0])
            )
          );
          const maxY = Math.max(
            ...Array.from(state.parent.selectedCells).map((coord) =>
              parseInt(coord.split(",")[1])
            )
          );
          return \`\${maxX},\${maxY}\`;
        },
      },
    },

    TotalCells: {
      extend: FooterText,
      props: {
        label: "Total cells selected: ",
        value: (_el, state) => {
          return state.parent.selectedCells?.size ?? 0;
        },
      },
    },
  },

  on: {
    stateInit: (element, state, context, updateOptions) => {
      const coords = [];
      for (let y = 0; y < element.props.rows; y++) {
        for (let x = 0; x < element.props.columns; x++) {
          coords.push(\`\${x},\${y}\`);
        }
      }

      const cells = coords.reduce((acc, item) => {
        return {
          ...acc,
          [\`cell\${item}\`]: {
            extend: CellButton,
          },
        };
      }, {});

      element.CellGrid = {
        ...element.CellGrid,
        ...cells,
      };

      return true;
    },
  },
};
`;

const pagesTemplate = `
"use strict";
export default {
  "/": {
    GridSelector: {
      props: {
        rows: ROWS,
        columns: COLUMNS,
      }
    },
  },
};
`;

program
  .name("create-grid-selector")
  .description("Generate a Grid Selector component with specified dimensions")
  .requiredOption("-x, --columns <number>", "number of columns", parseInt)
  .requiredOption("-y, --rows <number>", "number of rows", parseInt)
  .option(
    "-d, --dir <path>",
    "directory where the project should be created",
    "."
  )
  .action(async (options) => {
    const { columns, rows, dir } = options;

    // Validate input
    if (!Number.isInteger(columns) || columns < 1) {
      console.error("Error: Columns must be a positive integer");
      process.exit(1);
    }

    if (!Number.isInteger(rows) || rows < 1) {
      console.error("Error: Rows must be a positive integer");
      process.exit(1);
    }

    // Resolve and validate directory path
    const targetDir = path.resolve(dir);

    try {
      // Create target directory if it doesn't exist
      if (!fs.existsSync(targetDir)) {
        console.log(`Creating directory: ${targetDir}`);
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Change to target directory
      process.chdir(targetDir);

      // Clone repository
      console.log("Cloning starter kit repository...");
      execSync("git clone https://github.com/symbo-ls/starter-kit", {
        stdio: "inherit",
      });

      // Create src directory if it doesn't exist
      const srcDir = path.join(targetDir, "starter-kit/src");
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }

      // Write GridSelector.js
      console.log("Creating GridSelector component...");
      fs.writeFileSync(
        path.join(srcDir, "GridSelector.js"),
        gridSelectorTemplate
      );

      // Updating components.js
      console.log("Updating components.js...");
      const componentsPath = path.join(srcDir, "components.js");

      let existingContent = "";
      if (fs.existsSync(componentsPath)) {
        existingContent = fs.readFileSync(componentsPath, "utf8");
      }
      existingContent = existingContent.replace(/\n\s*\n\s*\n/g, "\n\n");

      const newContent =
        existingContent.trim() +
        "\n" +
        'export { GridSelector } from "./GridSelector";\n';

      fs.writeFileSync(componentsPath, newContent);

      // Update pages.js
      console.log("Updating pages.js...");
      const pagesContent = pagesTemplate
        .replace("ROWS", rows)
        .replace("COLUMNS", columns);
      fs.writeFileSync(path.join(srcDir, "pages.js"), pagesContent);

      console.log(
        "\nSuccess! Grid Selector has been created with the following configuration:"
      );
      console.log(`- Location: ${targetDir}`);
      console.log(`- Columns: ${columns}`);
      console.log(`- Rows: ${rows}`);
      console.log("\nTo get started:");
      console.log(`  cd ${dir}`);
      console.log("  npm install");
      console.log("  npm start");
    } catch (error) {
      console.error("Error:", error.message);
      if (error.stderr) {
        console.error("Details:", error.stderr.toString());
      }
      process.exit(1);
    }
  });

program.parse();
