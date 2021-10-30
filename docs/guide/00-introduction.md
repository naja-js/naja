# Introduction

In this tutorial, we start with a simple e-commerce application powered by Nette Framework, and we're going to AJAX-ify it using Naja. It is carefully designed to contain most of the common use cases and show how Naja can be used to solve them.

?> The source code of the application is available on [Github](https://github.com/naja-js/guide). The `main` branch contains the resulting AJAX-ified application. Each step of the tutorial adds several commits to the `main` branch and the result of each step is tagged.

## Set up

If you want to follow along, let's start by cloning the repository:

```sh
git clone git@github.com:naja-js/guide.git -b follow-along
```

?> Do not forget the `-b follow-along` option. (Or you can `git checkout follow-along` after the repository is cloned.) The default `main` branch contains the final result of this tutorial, while the `follow-along` branch points to the initial commit that you can build upon.

Follow the instructions in README to set it up and learn how to run it.

!> The project requires PHP 8.0 and above, and Node.js 14.0 and above.

## Overview

With the initial setup done, familiarize yourself with the project structure. Pay special attention to the source root:

```
src/
 ├─ Application/
 │   ├─ Routing/
 │   └─ UI/
 │       ├─ client/
 │       ├─ Components/
 │       └─ Presenters/
 └─ Domain/
```

The `Domain/` code is not really relevant for our tutorial. It contains a session-based shopping `Basket` implementation, and repositories with hard-coded catalog categories and products.

### Server-side UI code

The most important bit is the `Application/UI` directory. It contains the presenters and components that compose the UI of the application, namely the following presenters:

- `ProductListPresenter` that lists the products (in given category if provided),
- `ProductDetailPresenter` that shows the detail of a selected product, and
- `BasketPresenter` that shows the contents of the basket,

and the following components:

- `AddToBasketButton` that displays an "Add to Basket" button or plus/minus controls if given product already is in the basket,
- `BasketWidget` that shows the overview of the basket on every page,
- `CategoryFilter` that exposes a form to filter product list by category,
- `Paging` that shows a pagination at the bottom of the product list, and
- `Reviews` that loads and displays a third-party reviews widget for a given product.

### Client-side UI code

The client-side code resides in `Application/UI/client`. The `index.js` file is configured as the main entrypoint of the Webpack bundle and imports the remaining files:

- `categoryFilter.js` that attaches an `onChange` listener on the CategoryFilter component that submits the form,
- `forms.js` that imports and initializes the nette-forms client-side script,
- `sentry.js` that imports and configures the Sentry SDK for error logging,
- `matomo.js` that loads and configures the Matomo visitor analytics script, and
- `index.css` that Webpack picks up and extracts into a separate stylesheet.
