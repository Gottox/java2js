ANTLR_VERSION = 4.5
ANTLR = build/antlr-$(ANTLR_VERSION)-complete.jar
GRAMMAR = build/grammars/java/Java.g4
GRAMMAR_REPO = https://github.com/Gottox/grammars-v4.git

all: ghpages

watch:
	inotifyrun /bin/sh -c 'sleep 0.1;make lib/grammar ghpages/browser.js'


$(ANTLR):
	mkdir -p build;
	wget -c -O $@ http://www.antlr.org/download/antlr-$(ANTLR_VERSION)-complete.jar

$(GRAMMAR):
	git clone $(GRAMMAR_REPO) build/grammars || ( cd build/grammars && git pull )

lib/grammar: $(GRAMMAR) $(ANTLR)
	mkdir -p $@
	java -jar $(ANTLR) -visitor -no-listener -Dlanguage=JavaScript $<
	mv build/grammars/java/Java*.js build/grammars/java/Java*.tokens $@

clean:
	rm -fr lib/grammar

ghpages: ghpages/browser.js
	git clone -b gh-pages . $$PWD/tmp
	git -C tmp rm -rf $$PWD/tmp/*
	cp -r ghpages/* $$PWD/tmp
	git -C tmp add $$PWD/tmp
	git -C tmp commit -m "rebuild gh-pages based on `git rev-parse HEAD`"
	git -C tmp push $$PWD gh-pages
	rm -rf $$PWD/tmp


ghpages/browser.js: index.js lib/transpiler/*.js ghpages/HelloWorld.java lib/grammar
	browserify --debug -t brfs -s java2js $< > $@
.PHONY: clean ghpages watch
