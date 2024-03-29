echo merging origin main to current branch
git fetch origin main
git merge origin/main
git submodule foreach --recursive git fetch origin
git submodule foreach --recursive git merge origin/main
