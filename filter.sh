git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_NAME" = "=" ] || [ "$GIT_AUTHOR_NAME" = "bhavya" ]; then
    export GIT_AUTHOR_NAME="PriyanshTailor"
    export GIT_AUTHOR_EMAIL="PriyanshTailor@users.noreply.github.com"
fi
if [ "$GIT_COMMITTER_NAME" = "=" ] || [ "$GIT_COMMITTER_NAME" = "bhavya" ]; then
    export GIT_COMMITTER_NAME="PriyanshTailor"
    export GIT_COMMITTER_EMAIL="PriyanshTailor@users.noreply.github.com"
fi
' --msg-filter 'sed "/Co-authored-by: Cursor/d"' -- --all
