# Scripts in snippets

`ScriptLoader` executes scripts that are dynamically added to the page via snippets. If you have scripts in your
snippets, be aware that they might be executed multiple times as the user navigates the site. To prevent this, you can
add a `data-naja-script-id` attribute to the `<script>` tag – scripts with the same ID will be executed only once, even
if the user navigates to the same page multiple times:

```html
<!-- this script will be loaded only once -->
<script src="https://3rd.party.service/sdk/loader.js" data-naja-script-id="3rd-party-service"></script>

<!-- this script will be executed every time it appears in snippets -->
<script>
    3rd.party.service.init();
</script>
```

Note that in many cases, it is also possible (and often more convenient) to implement the desired behavior using
[extensions](extensibility.md).
