#
# Makefile
# tox, 2015-04-21 16:31
#

all: browser.js

browser.js: app.js
	browserify -s App $< > $@

clean:
	rm browser.js

.PHONY: clean

# vim:ft=make
#
