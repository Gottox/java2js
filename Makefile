ANTLR_VERSION = 4.5
ANTLR = tools/antlr-$(ANTLR_VERSION)-complete.jar
GRAMMAR = grammars/java/Java.g4
GRAMMAR_REPO = https://github.com/Gottox/grammars-v4.git

all: grammar

tools:
	mkdir tools;

$(ANTLR): tools
	wget -O $@ http://www.antlr.org/download/antlr-$(ANTLR_VERSION)-complete.jar

$(GRAMMAR):
	git clone $(GRAMMAR_REPO) grammars || ( cd grammars && git pull )

grammar: $(GRAMMAR) $(ANTLR)
	java -jar $(ANTLR) -visitor -Dlanguage=JavaScript $<
	mkdir -p grammar
	mv grammars/java/Java*.js grammar

clean:
	rm -fr tools grammars

ghpages: ghpages/browser.js

ghpages/browser.js: ghpages/app.js transpiler/*.js ghpages/HelloWorld.java
	browserify --debug -t brfs -s App $< > $@
.PHONY: clean ghpages
