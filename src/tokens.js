import { ExternalTokenizer } from "lezer";
import * as terms from "./parser.terms.js";

const LPAREN = "(".codePointAt(0);
const DQUOTE = '"'.codePointAt(0);
const HASH = "#".codePointAt(0);
const EQUAL = "=".codePointAt(0);
const NEWLINE = "\n".codePointAt(0);

const isTripleQuote = (input, pos) => {
  return (
    input.get(pos) === DQUOTE &&
    input.get(pos + 1) === DQUOTE &&
    input.get(pos + 2) === DQUOTE
  );
};

const isBlockCommentStart = (input, pos) => {
  return input.get(pos) === HASH && input.get(pos + 1) === EQUAL;
};

const isBlockCommentEnd = (input, pos) => {
  return input.get(pos) === EQUAL && input.get(pos + 1) === HASH;
};

export const token = new ExternalTokenizer(
  (input, token, stack) => {
    // newline if needed, otherwise whitespace
    if (input.get(token.start) === NEWLINE) {
      if (stack.canShift(terms.newline)) {
        token.accept(terms.newline, token.start);
        return;
      }
    }
    // immediateParen
    if (
      input.get(token.start) === LPAREN &&
      stack.canShift(terms.immediateParen)
    ) {
      token.accept(terms.immediateParen, token.start - 1);
      return;
    }
    // TripleString
    if (isTripleQuote(input, token.start)) {
      let cur = token.start + 3;
      while (!isTripleQuote(input, cur)) {
        cur = cur + 1;
      }
      token.accept(terms.TripleString, cur + 3);
      return;
    }
    // BlockComment
    if (isBlockCommentStart(input, token.start)) {
      let depth = 1;
      let cur = token.start + 2;
      while (cur < input.length) {
        if (isBlockCommentEnd(input, cur)) {
          depth = depth - 1;
          if (depth === 0) {
            token.accept(terms.BlockComment, cur + 2);
            return;
          }
          cur = cur + 2;
        } else if (isBlockCommentStart(input, cur)) {
          depth = depth + 1;
          cur = cur + 2;
        } else {
          cur = cur + 1;
        }
      }
      token.accept(terms.BlockComment, cur);
    }
  },
  { extend: true }
);
