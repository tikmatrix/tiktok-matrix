set http_proxy=http://127.0.0.1:7890 & set https_proxy=http://127.0.0.1:7890
git pull --recurse-submodules=on-demand
git push --recurse-submodules=on-demand