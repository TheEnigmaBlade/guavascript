# GuavaScript

![](http://i.imgur.com/gdOy8ad.png)

A simpler Javascript without oversimplifying like CoffeScript and its relatives.

*Note: Specific syntax is highly variable.*

---

## Most notable changes

### Syntax

* No semicolons
* No parentheses around conditionals

### Commonly-used function aliases

* `print(...)` is equivalent to `console.log(...)`
* `error(...)` is equivalent to `console.error(...)`

### Anonymous functions

Unnamed anonymous functions are simplified as `{{...}}`.

```javascript
//GuavaScript

doThing({{
    callbackAction()
}})

getThing({{|thing|
    callbackAction(thing)
}})
```

```javascript
//Javascript

doThing(function() {
    callbackAction();
});

getThing(function(thing) {
    callbackAction(thing);
});
```

If an anonymous function is placed as a top-level expression, it will be wrapped to be immediately invoked.
This is especially useful with additional syntactic sugar to invoke a function with an anonymous function as the only argument, `f{{...}}`.

```javascript
//GuavaScript
${{
    jQueryThings()
}}
```

```javascript
//Javascript
$(function() {
    jQueryThings();
})();
```

### `loop`

A simple infinite loop, because typing `while(true)` is a lot of work. Not much more to it.

```javascript
//GuavaScript
loop {
    print("I'm not dead yet!")
}
```

```javascript
//Javascript
while(true) {
    console.log("I'm not dead yet!");
}
```

### `for` loops

```javascript
//GuavaScript

for n in 0..10 {
    count(n)
}

for n in 0..12 by 3 {
    countBy3(n)
}
```

```javascript
//Javascript

for(var n = 0; n < 10; n++) {
    count(n);
}

for(var n = 0; n < 12; n+=3) {
    countBy3(n);
}
```
