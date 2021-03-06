GIT_MODIFIED_UPDATED = $(shell git status --porcelain | grep -E '.?[AM].+[.]js(on)?$$' | sed -e "s/^...//g")

tidy:
	@./node_modules/js-beautify/js/bin/js-beautify.js -p -k -w120 -r -f $(GIT_MODIFIED_UPDATED)

lint:
	@./node_modules/jshint/bin/jshint --verbose $(GIT_MODIFIED_UPDATED)

server:
	@NODE_PATH=lib && ./node_modules/nodemon/bin/nodemon.js app.js

dev:
	@NODE_PATH=lib && node bin/make-less.js
