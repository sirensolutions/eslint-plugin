# Prevent adding a new enzyme test file

This rule use git to get a list of all the new files in a commit.

For every new file which is a test file, it checks if the file has an import from enzyme. If it does, that means it is an enzyme test and in that case, throw an error.
