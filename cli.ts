#!/usr/bin/env -S deno --allow-env --allow-run --allow-read --allow-write

import { parse } from "https://deno.land/std/flags/mod.ts";
import repack from "./index.ts";

// Parse command line options
const { args } = Deno;
const parsedArgs = parse(args);

if (parsedArgs.help) {
  console.log(`
  Repack file create by noteScript.
  Repack for ${Deno.build.os} is a tool for packaging or replacing content.
  INSTALL:
    deno install --allow-read --allow-write --allow-run --allow-env -f -n repack https://raw.githubusercontent.com/noteScript/reepack/deno/cli.ts
  USAGE:
    repack [command]
  COMMAND:
    repack i    Enter the contents of
    repack o    Output the contents
  OPTIONS:
    --help          Prints help information
    `);
  Deno.exit();
}

if (parsedArgs._.includes('i')){
  repack.handleInput();
  Deno.exit();
}

if (parsedArgs._.includes('o')){
  repack.handleOutput();
  Deno.exit();
}
