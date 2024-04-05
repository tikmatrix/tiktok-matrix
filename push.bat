echo committing
git add .
git commit -a -m "commit by auto"
git push
git submodule foreach --recursive 'git add . && git commit -a -m "commit by auto" || echo "No changes to commit" && git push'

