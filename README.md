# GuavaScript

![](http://i.imgur.com/gdOy8ad.png)

A simpler Javascript without oversimplifying like CoffeScript and its relatives.

The long-term goal is for more portions of the language to be considered expressions, allowing the use of `if`s and loops in variable declarations and other locations (similar to Rust). This currently doesn't work.

*Note: Specific syntax is highly variable, and it not yet 100% feature parity with Javascript.*

---

## Differences from Javascript

### Syntax

* No semicolons.
* No parentheses around conditionals.
* **Sensitive to line breaks.** Lenient around blocks and other separation characters (like commas).
* `==` is `===`. There is no equivalent of Javascript's `==`.
* `and`, `or`, and `not` are used in place of `&&`, `||`, and `!`.

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

### Functions

Mostly the same as Javascript, but functions without parameters don't require parentheses.
Currently `func` or `fun` in place of `function`, but only because I've yet to decided which is best.

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

### `for-each` loops

A shortcut for looping through arrays.

```javascript
//GuavaScript
for x in x_list {
    doThing(x)
}
```

```javascript
//Javascript
for(var n = 0; n < x_list.length; n++) {
    var x = x_list[n];
    doThing(x);
}
```
