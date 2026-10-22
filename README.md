```console
pnpm install
node src/node_repro.ts
```

Take a look to `src/node_repro.ts`.

- First try-catch is OK.
- Second try-catch is not working. `node:events:505`, `throw er; // Unhandled 'error' event`
- So the third one in not run.

Comment or remove the Second try-catch and re-run the script. catch clause don't run either.

---

I'm sorry, but I try to reproduce my issue with flydrive without success.
[flydrive_repro.ts](src/flydrive_repro.ts)

My code exiting the node process with `Unhandled 'error' event` run `copyFromFs`,
from a `Disk` with `FSDriver`, run from an AdonisJS command, inside a service, using dependency injection.
Inside a database transaction, with `Promise.all` to copy multiple files at the same time.

I tried to reproduce a similar setup with 20 files and with only 5 which exists.

I'm pretty sure it comes from flydrive (adonisjs drive seems only glue the drive manager with the config),
because removing the call to `copyFromFs` avoid to produce unhandled error.
Also, editing the `copyFromFs` method in `node_modules/flydrive/build/index.js` (`Disk` class) from

```ts
  copyFromFs(source, destination, options) {
    return this.putStream(destination, createReadStream(source), options)
  }
```

to

```ts
  copyFromFs(source, destination, options) {
    const contents = createReadStream(source)
    // no process exit from uncaught error
    // real error caughting done by the driver, but may have race condition due to async hop.
    contents.once('error', () => {})
    return this.putStream(destination, contents, options)
  }
```

Also avoid the unhandled error. It may not be the better fix, but it is working.
