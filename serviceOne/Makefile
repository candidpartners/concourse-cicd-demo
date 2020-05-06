.PHONY: default infrastructure lambda-build lambda-test lambda-deploy functional_tests

default: infrastructure lambda-build lambda-test lambda-deploy functional_tests 

infrastructure:
	make -C infrastructure

lambda-build:
	make -C lambda build

lambda-test:
	make -C lambda test

lambda-deploy:
	make -C lambda deploy

functional_tests:
	make -C functional_tests