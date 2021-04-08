#!/usr/bin/env node

import { inspect } from "util";
import * as fs from "fs";
import { stringInput, Tree } from "lezer-tree";
import { parser } from "../src/index.js";

function printTree(tree, input, from = 0, to = input.length) {
  if (typeof input === "string") input = stringInput(input);
  let out = "";
  const c = tree.cursor();
  const childPrefixes = [];
  for (;;) {
    const { type } = c;
    const cfrom = c.from;
    const cto = c.to;
    let leave = false;
    if (cfrom <= to && cto >= from) {
      if (!type.isAnonymous) {
        leave = true;
        if (!type.isTop) {
          out += "\n" + childPrefixes.join("");
          if (c.nextSibling() && c.prevSibling()) {
            out += " ?? ";
            childPrefixes.push(" ?  ");
          } else {
            out += " ?? ";
            childPrefixes.push("    ");
          }
        }
        out += type.name;
      }
      const isLeaf = !c.firstChild();
      if (!type.isAnonymous) {
        const hasRange = cfrom !== cto;
        out += ` ${
          hasRange ? `[${inspect(cfrom)}..${inspect(cto)}]` : inspect(cfrom)
        }`;
        if (isLeaf && hasRange) {
          out += `: ${inspect(input.read(cfrom, cto))}`;
        }
      }
      if (!isLeaf || type.isTop) continue;
    }
    for (;;) {
      if (leave) childPrefixes.pop();
      leave = c.type.isAnonymous;
      if (c.nextSibling()) break;
      if (!c.parent()) return out;
      leave = true;
    }
  }
}

function hlerror(s) {
  return `\u001b[31m${s}\u001b[39m`;
}

const NEWLINE = "\n".codePointAt(0);

let filename = process.argv[2];
let input = fs.readFileSync(filename, "utf8");
let tree;
try {
  tree = parser.configure({ strict: true }).parse(input);
} catch (e) {
  if (e instanceof SyntaxError) {
    let m = /No parse at (\d+)/.exec(e.message);
    if (m) {
      let pos = parseInt(m[1], 10);
      // add EOF marker
      let inp = stringInput(input + '␄');
      // find start of the line
      let s = pos - 1;
      while (inp.get(s) !== NEWLINE && s >= 0) {
        s = s - 1;
      }
      // find end of the line
      let e = pos;
      while (inp.get(e) !== NEWLINE && e < inp.length) {
        e = e + 1;
      }
      // report error
      console.log(hlerror(`SYNTAX ERROR at ${pos}:`));
      console.log(inp.read(s + 1, e));
      console.log(hlerror("^".padStart(pos - s, " ")));
      process.exit(1);
    }
  }
  throw e;
}
console.log(printTree(tree, input));
