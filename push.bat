echo committing
git add .
git commit -a -m "commit by auto"
git push
git submodule foreach git add .
git submodule foreach "git commit -a -m 'commit by auto' || echo nothing to commit"
git submodule foreach git push
