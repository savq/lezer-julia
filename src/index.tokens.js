import { ExternalTokenizer } from "lezer";
import * as terms from "./index.terms.js";

const DOT = ".".codePointAt(0);
const BACKSLASH = "\\".codePointAt(0);
const BACKQUOTE = "`".codePointAt(0);
const DOLLAR = "$".codePointAt(0);
const HASH = "#".codePointAt(0);
const EQUAL = "=".codePointAt(0);
const LPAREN = "(".codePointAt(0);
const LBRACE = "{".codePointAt(0);
const LBRACKET = "[".codePointAt(0);
const SEMICOLON = ";".codePointAt(0);
const COLON = ":".codePointAt(0);
const DQUOTE = '"'.codePointAt(0);
const NEWLINE = "\n".codePointAt(0);
const SPACE = " ".codePointAt(0);
const TAB = "\t".codePointAt(0);

const isWhitespace = (input, pos) => {
  let c = input.get(pos);
  return (
    (c >= 9 && c < 14) ||
    (c >= 32 && c < 33) ||
    (c >= 133 && c < 134) ||
    (c >= 160 && c < 161) ||
    (c >= 5760 && c < 5761) ||
    (c >= 8192 && c < 8203) ||
    (c >= 8232 && c < 8234) ||
    (c >= 8239 && c < 8240) ||
    (c >= 8287 && c < 8288) ||
    (c >= 12288 && c < 12289)
  );
};

const isTripleQuote = (input, pos) => {
  return (
    input.get(pos) === DQUOTE &&
    input.get(pos + 1) === DQUOTE &&
    input.get(pos + 2) === DQUOTE
  );
};

const isQuote = (input, pos) => {
  return input.get(pos) === DQUOTE;
};

const isBackquote = (input, pos) => {
  return input.get(pos) === BACKQUOTE;
};

const isBlockCommentStart = (input, pos) => {
  return input.get(pos) === HASH && input.get(pos + 1) === EQUAL;
};

const isBlockCommentEnd = (input, pos) => {
  return input.get(pos) === EQUAL && input.get(pos + 1) === HASH;
};

export const layout = new ExternalTokenizer((input, token, stack) => {
  let curr = input.get(token.start);
  if (curr === NEWLINE || curr === SEMICOLON) {
    if (stack.canShift(terms.terminator)) {
      token.accept(terms.terminator, token.start + 1);
      return;
    }
  }
});

const makeStringContent = ({ till, term }) => {
  return new ExternalTokenizer((input, token, stack) => {
    let pos = token.start;
    let eatNext = false;
    while (pos < input.length) {
      let c = input.get(pos);
      if (c === BACKSLASH) {
        eatNext = true;
      } else if (eatNext) {
        eatNext = false;
      } else if (c === DOLLAR || till(input, pos)) {
        if (pos > token.start) {
          token.accept(term, pos);
        }
        return;
      }
      pos = pos + 1;
    }
  });
};

export const tripleStringContent = makeStringContent({
  term: terms.tripleStringContent,
  till: isTripleQuote,
});
export const stringContent = makeStringContent({
  term: terms.stringContent,
  till: isQuote,
});
export const commandStringContent = makeStringContent({
  term: terms.commandStringContent,
  till: isBackquote,
});

export const tokens = new ExternalTokenizer((input, token, stack) => {
  // TripleString
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
});

export const layoutExtra = new ExternalTokenizer(
  (input, token, stack) => {
    // immediateParen
    if (
      input.get(token.start) === LPAREN &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateParen)
    ) {
      token.accept(terms.immediateParen, token.start);
      return;
    }
    // immediateColon
    if (
      input.get(token.start) === COLON &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateColon)
    ) {
      token.accept(terms.immediateColon, token.start);
      return;
    }
    // immediateBrace
    if (
      input.get(token.start) === LBRACE &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateBrace)
    ) {
      token.accept(terms.immediateBrace, token.start);
      return;
    }
    // immediateBracket
    if (
      input.get(token.start) === LBRACKET &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateBracket)
    ) {
      token.accept(terms.immediateBracket, token.start);
      return;
    }
    // immediateDoubleQuote
    if (
      input.get(token.start) === DQUOTE &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateDoubleQuote)
    ) {
      token.accept(terms.immediateDoubleQuote, token.start);
      return;
    }
    // immediateBackquote
    if (
      input.get(token.start) === BACKQUOTE &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateBackquote)
    ) {
      token.accept(terms.immediateBackquote, token.start);
      return;
    }
    // immediateDot
    if (
      input.get(token.start) === DOT &&
      !isWhitespace(input, token.start - 1) &&
      stack.canShift(terms.immediateDot)
    ) {
      token.accept(terms.immediateDot, token.start);
      return;
    }
    // nowhitespace
    if (
      !isWhitespace(input, token.start - 1) &&
      !isWhitespace(input, token.start) &&
      stack.canShift(terms.nowhitespace)
    ) {
      token.accept(terms.nowhitespace, token.start);
      return;
    }
  },
  {
    extend: true,
  }
);
