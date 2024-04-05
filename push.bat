echo committing
git add .
git commit -m "commit by auto"
git push
git submodule foreach --recursive git add .
git submodule foreach --recursive git commit -m "commit by auto"
git submodule foreach --recursive git push
