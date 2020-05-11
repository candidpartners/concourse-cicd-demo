JEST = npx jest --passWithNoTests --verbose

default: test

node_modules: package.json
	npm install

test: node_modules
	${JEST} ${TEST_SUITE}
