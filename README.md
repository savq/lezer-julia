# lezer-julia

**WORK-IN-PROGRESS: DO NOT USE**

This is a [Julia][] grammar for the [lezer][] parser system.

The grammar was initially ported from [tree-sitter-julia][] using
[lezer-parser/import-tree-sitter][] tool.

## Contributing

Initializing dev environment:

```
yarn
make
```

Running tests:

```
make test
```

## TODO

- [ ] More tests

  Need to write more tests as we uncover bugs (precedence and etc). Consider
  reporting/fixing them "upstream" at [tree-sitter-julia][].

- [ ] Review [tree-sitter-julia][] issues

  As this project is a port of the Julia's tree-sitter grammar we have
  inherited all its bugs for sure.

- [ ] Cleanup syntax structure

  Figure out a way to make trees less noisy. See Number/AnyNumber for
  example.

- [ ] Cleanup tokens

  We are missing lots of allowed lexical structures right now. Unicode!

- [ ] Figure out if we can avoid using external tokenizer for terminator

  The problem is we want to skip whitespace/newline most of the time but in
  some cases newline should be treated as terminator. Right now I use
  external tokenizer which produces newline token only in case it is allowed
  by the grammar but my understanding is that it's possible to handle w/
  lezer's tokenizer somehow.

[lezer]: https://lezer.codemirror.net/
[Julia]: https://julialang.org
[tree-sitter-julia]: https://github.com/tree-sitter/tree-sitter-julia
[lezer-parser/import-tree-sitter]: https://github.com/lezer-parser/import-tree-sitter
