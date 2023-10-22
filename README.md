# lezer-julia

This is a [Julia][] grammar for the [lezer][] parser system.

The grammar was initially ported from [tree-sitter-julia][] using
[lezer-parser/import-tree-sitter][] tool.

## Contributing

Initializing dev environment:

```
yarn install
make
```

> If you crash and it looks like there is too little memory, trying running `export NODE_OPTIONS="--max-old-space-size=8192"` before running `make`

Running tests:

```
make test
```

[lezer]: https://lezer.codemirror.net/
[julia]: https://julialang.org
[tree-sitter-julia]: https://github.com/tree-sitter/tree-sitter-julia
[lezer-parser/import-tree-sitter]: https://github.com/lezer-parser/import-tree-sitter
