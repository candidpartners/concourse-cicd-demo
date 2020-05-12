.PHONY: check_env kinesisToDynamo s3ToDynamo

# Validate that $ENV environment variable is set and that a
# corresponding file exists in the config directory
check_env:
ifndef ENV
	$(error environment variable ENV is not set)
endif
ifeq (,$(wildcard ./config/${ENV}.json))
	$(error environment file ./config/${ENV}.json not found)
endif


kinesisToDynamo:
	make -C kinesisToDynamo

s3ToDynamo:
	make -C s3ToDynamo

clean:
	git clean -fdX
