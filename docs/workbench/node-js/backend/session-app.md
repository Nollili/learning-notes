# Session application reference

This is the complete HTTP application used by the session, CSRF, registration, login, password-recovery and task-ownership examples in this chapter. The listing comes directly from the source file, rather than a separately maintained copy.

**Local file:** `examples/node-textbook/src/app.ts`, inside the repository's `examples` folder, alongside `docs`. It is not a file under `docs/node-js` and is not an HTTP endpoint.

The file exports `createApp`; it does not start a server by itself. Its imports are supplied by the other files in `examples/node-textbook/src`, and setup instructions are in that project's `README.md`. Run the project from `examples/node-textbook` using its own package and database configuration.

<<< ../../../../examples/node-textbook/src/app.ts
