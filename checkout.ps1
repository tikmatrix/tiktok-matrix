param([string]$branch)
echo checkouting $branch
git checkout $branch
git submodule foreach --recursive git checkout $branch
