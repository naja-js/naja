# Contributing to Naja

First of all, let me thank you for choosing to support the development of Naja by taking part in it, you are awesome! 🙏


## Issues

You can use the issue tracker to:

- **Report bugs.** Please take care to describe the problem in as much detail as possible. Include the information about what OS/browser is affected and what version of Naja you are using. If possible, attach a minimal piece of code to reproduce the problem, or open a pull request with a failing test.
- **Request new features:** Before submitting a feature request, please take a short time to consider how the proposed feature fits within the scope of the project. If you are unsure about how your problem should be solved, please clearly describe your use case to initiate a discussion.


## Contributing code

By following these guidelines, you can make the whole process of reviewing and accepting your pull request much smoother. But don't consider them carved in stone; if you're not sure about something, just open the PR and ask :)

### General guidelines

- Please open pull requests from specific branches against `main`. Open a separate pull request for each requested change or bugfix.
- More smaller, dedicated commits with concise commit messages are better than a big messy one with a lot of changes. Each commit should be usable on its own, with working code and passing tests (see below).
- Describe as clearly as possible your intent and the reasoning behind the proposed changes. Provide links to related issues if there are any.
- Cover the proposed changes with tests: add new tests for features and regression tests for bugfixes.

### Code style and tests

- Keep the coding style. You can run the linter via `yarn run lint` to check for CS violations.
- Tests must pass. You can run them via `yarn run test`. This launches Karma and runs the test suite in Chrome. On the CI server, the tests are executed on a wider range of browsers to ensure that the changes in code are compatible.
- As a last step, you should run `yarn run build` to make sure that Naja builds correctly with your changes included.
- Generally speaking, Github Actions must report all green before your pull request can be merged.
