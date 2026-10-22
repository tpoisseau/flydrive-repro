```console
pnpm install
node src/flydrive_repro.ts --unhandled-error
```

~~I'm sorry, but I tried to reproduce my issue with flydrive, but without success.~~
[flydrive_repro.ts](src/flydrive_repro.ts)

<details>
<summary><s>outdated supposition</s></summary>

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

</details>

**Using key with unsupported chars produce an error (by the normalizer), before an error listener is attached to the stream.**

---

My flydrive repro show another issue.

`copyFromFs` call generate the `destination` file (empty), even if the `source` does not exist.

```console
node src/flydrive_repro.ts
ls storage
```

**Should only show the .gitignore and 1, 5, 10, 15, 19 copied files. But also show all missing files of `1-19` range**
