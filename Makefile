BIN = $(PWD)/node_modules/.bin
LEZER_ARGS =
ifdef DEBUG
	LEZER_ARGS = --names $(LEZER_ARGS)
endif

.DELETE_ON_ERROR:

.PHONY: default
default: build

.PHONY: build
build: dist/index.cjs dist/index.es.js

.PHONY: test
test: build
	$(BIN)/mocha test/test-julia.js

src/parser.js src/parser.terms.js: src/julia.grammar
	$(BIN)/lezer-generator --names $(<) -o src/parser

dist/index.cjs dist/index.es.js: src/tokens.js src/parser.js src/parser.terms.js
	$(BIN)/rollup -c
