[![Build Status](https://secure.travis-ci.org/microjs/path.png?branch=master)](https://travis-ci.org/microjs/path)
# Path

Path is a lightweight, client-side routing library that allows you to create "single page" applications using Hashbangs and/or HTML5 pushState.

## Features

* Lightweight
* Supports the HTML5 History API, the 'onhashchange' method, and graceful degredation
* Supports root routes, rescue methods, paramaterized routes, optional route components (dynamic routes), and Aspect Oriented Programming
* Well Tested (tests available in the `./tests` directory)
* Compatible with all major browsers (Tested on Firefox 3.6, Firefox 4.0, Firefox 5.0, Chrome 9, Opera 11, IE7, IE8, IE9)
* Independant of all third party libraries, but plays nice with all of them

## Using Path - A Brief Example

```javascript
function clearPanel(){
  // You can put some code in here to do fancy DOM transitions, such as fade-out or slide-in.
}

Path.map("#/users").to(function(){
  alert("Users!");
});

Path.map("#/comments").to(function(){
  alert("Comments!");
}).enter(clearPanel);

Path.map("#/posts").to(function(){
  alert("Posts!");
}).enter(clearPanel);

Path.root("#/posts");

Path.listen();
```

## Documentation and Tips

Any of the examples above confuse you?  Read up on the details in the [wiki](https://github.com/mtrpcic/pathjs/wiki).

## Examples

You can find examples on the official [Github Page](http://mtrpcic.github.com/pathjs).

## Running Tests

To run the tests, simply navigate to the `./tests` folder and open the HTML file in your browser.  Please note that the HTML5 History API is not compatible with the
`file://` protocol, and to run the tests in the `tests/pushstate` folder, you will need to run them through a webserver such as nginx or Apache.

## Next Steps

* Adding support for "after" callbacks
* Deprecating the "enter" callback in favour of "before"

## License

  MIT