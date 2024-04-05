echo committing
git add .
git commit -a -m "commit by auto"
git push
git submodule foreach --recursive git add .
git submodule foreach --recursive git commit -a -m "commit by auto" || echo "nothing to commit"
git submodule foreach --recursive git push
