# Closing thoughts

?> If you want to follow along with this step of the tutorial **and don't have the code from the previous step,** checkout a new branch off the `step-8` tag: `git checkout -B follow-along step-8`

## Make use of the nette-forms integration

There is one last, tiny, mostly cosmetical change: we can remove the `forms.js` script. Naja integrates with nette-forms and initializes it automatically, we only need to provide the correct imported reference to it.

Update the `index.js` file: import `nette-forms` instead of the original `./forms`:

```diff
- import './forms';
+ import netteForms from 'nette-forms';
```

And set the imported reference to Naja:

```diff
+ naja.formsHandler.netteForms = netteForms;
  naja.initialize();
```

?> You can learn more about Naja's integration with nette-forms in [Forms](/forms.md).


## That's it!

We've successfully used Naja to add AJAX capabilities to our full-featured Nette Framework-powered application. Thanks to Naja's integration into the browser's History API, the application now provides a user experience similar to single-page applications, without requiring many changes server-side.

I hope this guide has covered the most common use cases and peculiarities that you might encounter in typical web applications. Feel free to continue exploring the rest of the docs to learn more about various corners of Naja. And if you get stuck, you can always [ask for help](https://github.com/jiripudil/Naja/discussions/new?category=support) on Github.
