# Forms

Naja integrates with the `nette-forms` client-side script if it is loaded. It initializes forms added to the page via snippets and prevents their submission if they fail to validate.


## Custom nette-forms

By default, the nette-forms object is expected to reside in the global namespace: `window.Nette`. If you use ES modules and import `nette-forms` into a different variable, you should configure the correct reference manually:

```js
import netteForms from 'nette-forms';
naja.formsHandler.netteForms = netteForms;
```
