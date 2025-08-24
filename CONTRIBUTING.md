# Contributing

- [Contributing](#contributing)
  - [Reporting Bugs](#reporting-bugs)
    - [How Do I Submit a Bug Report?](#how-do-i-submit-a-bug-report)
  - [Suggesting Enhancements](#suggesting-enhancements)
    - [How Do I Submit a Suggested Enhancement?](#how-do-i-submit-a-suggested-enhancement)
  - [Contributions](#contributions)
    - [File Naming Convention](#file-naming-convention)
    - [Content Requirements](#content-requirements)
    - [Commits](#commits)
    - [Pull Requests](#pull-requests)

Thank you for taking the time to contribute!

The following guidelines are intended to ensure a consistent, high-quality experience for all contributors to `wallpapers`. These are guidelines, not strict rules—use your best judgement, and feel free to propose improvements to this document via a pull request.

## Reporting Bugs

This section guides you through submitting a bug report for `wallpapers`. Following these guidelines helps maintainers and the community understand your report, reproduce the behaviour, and find related reports.

Before creating bug reports, please check that your issue does not already exist in the issue tracker. When creating a bug report, include as many details as possible. Fill out the required template; the information it requests helps maintainers resolve the issue efficiently.

> **Note:** If you find a **Closed** issue that appears to be the same as your experience, open a new issue and include a link to the original issue in your report.

### How Do I Submit a Bug Report?

Bugs concerning `wallpapers` should be submitted to the main issue tracker, using the correct issue template.

Explain the problem clearly to facilitate understanding and resolution:

- Use a clear and descriptive title for the issue to identify the problem
- Describe the exact steps to reproduce the problem, in as much detail as possible
- Describe the behaviour you observed after following the steps, and explain why this is a bug
- Explain the behaviour you expected to see instead, and why

Provide detailed steps for reproducing your issue:

- Provide specific examples to demonstrate the steps to reproduce the issue. This could be an example repository or a sequence of steps run in a container
- If you are unable to reliably reproduce the issue, provide details about how often the problem occurs and under which conditions

Provide additional context by answering these questions:

- Did the problem start happening recently (e.g., after updating to a new version of `wallpapers`), or has this always been an issue?
- If the problem started recently, can you reproduce it in an older version? What is the most recent version in which the problem does not occur?
- Is there anything unusual about your environment (e.g., special container images, new CPU architectures such as Apple Silicon)?

Include details about your configuration and environment:

- What is the name and version of the browser you are using?

To give others the best chance to understand and reproduce your issue, please put extra effort into your reproduction steps. You can rule out local configuration issues and ensure others can reproduce your issue by attempting all reproductions in a pristine container (or VM), and providing the steps you performed inside that environment in your report.

## Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for `wallpapers`, including new features and improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion and find related suggestions.

Before creating enhancement suggestions, please check the issue tracker to see if a similar suggestion already exists. When creating a suggestion, include as many details as possible. Fill in the template, including the steps you imagine you would take if the feature you are requesting existed.

### How Do I Submit a Suggested Enhancement?

Suggested enhancements should be submitted to the main issue tracker, using the correct issue template.

- Use a clear and descriptive title for the issue to identify the suggestion
- Provide a detailed description of the proposed enhancement, with specific steps or examples where possible
- Describe the current behaviour and explain which behaviour you would like to see instead, and why

## Contributions

To maintain quality and consistency, please follow these rules when adding wallpapers. Place all wallpapers in the `./app/static/wallpapers` directory. No subdirectories are needed.

### File Naming Convention

All wallpapers must follow this format:

`<name>_<tag_0>_<tag_1>_<tag_2>.png`

- **Wallpaper name:** lowercase letters only, words separated by `-`. No spaces or special characters
- **Tags:** lowercase letters only, separated by `_`
- **GIFs:** must include the `animated` tag
- **Static versions:** if a GIF exists, a static PNG version must also exist, using the same name with a `static` tag
- **Accepted formats:** PNG, GIF only

### Content Requirements

- High-quality images only (avoid blurry, pixelated, or low-resolution wallpapers; minimum resolution: 1920x1080 recommended)
- No NSFW or offensive content

### Commits

We follow the [conventional commit message syntax](https://www.conventionalcommits.org/en/v1.0.0) for our commits. For example:
`feat: allow provided configuration object to extend other configurations`.

Every feature branch that is squashed onto the main branch must follow these rules. The benefits are:

- A standard way of writing commit messages for every contributor
- A way to quickly see and understand what the commit does and what it affects
- Automatic changelog creation based on those keywords

The supported keywords (heavily inspired by [`config-conventional`](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional)) are:

- `ci`
- `chore`
- `docs`
- `feat`
- `fix`
- `perf`
- `refactor`
- `revert`
- `style`
- `test`

All commit messages should be written in lowercase.

> **Note:** All commits in a pull request are squashed when merged into the `main` branch. Only the commit message of the squashed branch needs to follow this convention. You do not need to follow this convention for commits within a branch, which may contain many `wip` (work in progress) titles.

### Pull Requests

- Complete the pull request body and describe your changes as accurately as possible. The pull request body should be kept up to date, as it will usually form the basis for the final merge commit and the changelog entry
- Ensure your pull request contains tests that cover the changed or added code. Tests are generally required for code to be considered mergeable, and code without passing tests will not be merged
- Ensure your pull request passes all checks. You can run these tools locally instead of relying solely on remote CI
- If your changes require a documentation update, the pull request must also update the documentation. Review the documentation preview generated by CI for any rendering issues

> **Note:** Ensure your branch is rebased against the latest `main` branch. A maintainer may ask you to ensure the branch is up to date prior to merging your pull request (especially if there have been CI changes on the `main` branch), and will also ask you to resolve any conflicts.

All pull requests, unless otherwise instructed, must first be accepted into the `main` branch. Maintainers will decide if any backports to other branches are required and will carry them out as needed.
