ANTLR_VERSION = 4.5
ANTLR = tools/antlr-$(ANTLR_VERSION)-complete.jar
GRAMMAR = grammars/java/Java.g4
GRAMMAR_REPO = https://github.com/Gottox/grammars-v4.git

all: ghpages

watch:
	inotifyrun /bin/sh -c 'sleep 0.1;make ghpages/browser.js'


$(ANTLR):
	mkdir -p tools;
	wget -c -O $@ http://www.antlr.org/download/antlr-$(ANTLR_VERSION)-complete.jar

$(GRAMMAR):
	git clone $(GRAMMAR_REPO) grammars || ( cd grammars && git pull )

grammar: $(GRAMMAR) $(ANTLR)
	java -jar $(ANTLR) -visitor -Dlanguage=JavaScript $<
	mkdir -p grammar
	mv grammars/java/Java*.js grammar

clean:
	rm -fr tools grammars

ghpages: ghpages/browser.js
	git clone -b gh-pages . $$PWD/tmp
	git -C tmp rm -rf $$PWD/tmp/*
	cp -r ghpages/* $$PWD/tmp
	git -C tmp add $$PWD/tmp
	git -C tmp commit -m "rebuild gh-pages based on `git rev-parse HEAD`"
	git -C tmp push $$PWD gh-pages
	rm -rf $$PWD/tmp


ghpages/browser.js: ghpages/app.js transpiler/*.js ghpages/HelloWorld.java
	browserify --debug -t brfs -s App $< > $@
.PHONY: clean ghpages watch
