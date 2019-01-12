echo "Travis pull_request job"

# Preview changes that would be made if the PR were merged.
case ${TRAVIS_BRANCH} in
    master)
        pulumi stack select nunciato/blog-staging
        pulumi preview
        ;;
    production)
        pulumi stack select nunciato/blog-production
        pulumi preview
        ;;
    *)
        echo "No Pulumi stack targeted by pull request branch ${TRAVIS_BRANCH}."
        ;;
esac
