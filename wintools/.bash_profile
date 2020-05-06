export ENV=greg
export AWS_PROFILE=candid-developers

# TODO: Get these dynamically
export AWS_ACCESS_KEY_ID=AKIAQCX6JGDHLOOXGTHB
export AWS_SECRET_ACCESS_KEY=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

# Looks up the directory tree for a specific file to find the $PROJECT_ROOT.
# Then sets $RELATIVE_DIR to the current relative directory inside the $PROJECT_ROOT.
find_project_root() {
    PROJECT_ROOT=
    RELATIVE_DIR=
    testfile=$1
    CURRENT=`pwd`
    x=$CURRENT

    if [ -e "$x/$testfile" ]; then
        # Current dir is the project root
        PROJECT_ROOT=$x
        return 0
    fi

    # Traverse upwards until we find the test file
    while [ "$x" != "/" ] ; do
        x=`dirname "$x"`
        output=`find "$x" -maxdepth 1 -name $testfile`
	if [ ! -z "$output" ]; then
            PROJECT_ROOT=$x
            RELATIVE_DIR=${CURRENT#$PROJECT_ROOT}
            return 0
        fi
    done
    return 1
}

mk()
{
    if ! find_project_root project-settings.json; then
        echo "Could not find project root.  Are you inside a project?"
        return 1
    fi

    export MSYS_NO_PATHCONV=1
    winpty docker run \
 	-e ENV -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY \
        -v "$PROJECT_ROOT":/mnt -i 04a16902af04 \
        bash -c "cd /mnt${RELATIVE_DIR}; make $@"
    export MSYS_NO_PATHCONV=0
}
