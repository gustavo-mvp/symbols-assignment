"use strict";

import { create, Flex } from "smbls";

import designSystem from "./designSystem";
import * as components from "./components";
import pages from "./pages";

create(
  {
    extend: Flex,
    props: {
      theme: "document",
      flow: "column",
      height: "100vh",
      align: "center",
      justifyContent: "center",
      background: 'url("/images/background.jpg)"',
    },
  },
  {
    designSystem,
    components,
    pages,
  }
);
