param([string]$message)
# required: $message
if ($message -eq "") {
    $message = "commit by commit.ps1"
}
echo commint: $message
git submodule foreach git add .
git submodule foreach git commit -m $message | echo "Nothing to commit"
git add .
git commit -m $message
