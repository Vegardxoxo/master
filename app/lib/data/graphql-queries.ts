export const getCommitsOnMain = `
                        query commitsOnMain($owner: String!, $repo: String!, $branch: String!) {
                            repository(owner: $owner, name: $repo) {
                                ref(qualifiedName: $branch) {
                                    target {
                                        ... on Commit {
                                            history(first: 100) {
                                                nodes {
                                                    oid
                                                    messageHeadline
                                                    message
                                                    commitUrl
                                                    author {
                                                        name
                                                        email
                                                        date
                                                    }
                                                    associatedPullRequests(first: 1) {
                                                        nodes {
                                                            number
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    `;

