echo merging origin main to current branch
git add .
git commit -m "merge origin main to current branch"
git fetch origin main
git merge origin/main
git submodule foreach --recursive git fetch origin
git submodule foreach --recursive git merge origin/main
