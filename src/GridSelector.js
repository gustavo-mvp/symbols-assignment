
import { Button, Flex, Grid } from "smbls";

const getCellCoord = (key) => key.replace("cell", "").split(",");

const CellButton = {
  extend: Button,
  props: ({ key }, state) => {
    const [x, y] = getCellCoord(key);
    const isSelected = state.parent.selectedCells?.has(`${x},${y}`);

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
        templateColumns: `repeat(${props.columns}, 1fr)`,
        aspectRatio: `${props.columns}/${props.rows}`,
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
              newSelection.add(`${i},${j}`);
            }
          }
          state.parent.clean()
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
      padding: '0',
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
          return `${maxX},${maxY}`;
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
    stateCreated: (element, state, context, updateOptions) => {
      const coords = [];
      for (let y = 0; y < element.props.rows; y++) {
        for (let x = 0; x < element.props.columns; x++) {
          coords.push(`${x},${y}`);
        }
      }

      const cells = coords.reduce((acc, item) => {
        return {
          ...acc,
          [`cell${item}`]: {
            extend: CellButton,
          },
        };
      }, {});

      element.CellGrid = {
        ...element.CellGrid,
        ...cells,
      };

    },
  },
};
