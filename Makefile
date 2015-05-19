#
# Makefile
# tox, 2015-04-21 16:31
#

all: browser.js

browser.js: app.js transpiler/*
	browserify -t brfs -s App $< > $@

clean:
	rm -f browser.js

.PHONY: clean

# vim:ft=make
#
