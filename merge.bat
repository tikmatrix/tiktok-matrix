echo merging origin main to current branch
git merge origin/main
git submodule foreach --recursive git merge origin/main
