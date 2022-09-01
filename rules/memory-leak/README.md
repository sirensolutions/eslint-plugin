# Prevent subscribing to event without de-registration (`memory-leak`)

When subscribing to events, you must remember to add an associated deregistration somewhere in your component's lifecycle. Otherwise, continual event subscriptions will build up and cause memory usage issues. So, when the following happens:

```js
const removeEventListener = x.on('some-event', () => console.log('even happened'));
``` 

Any of these must also be found in the same file:

```js
removeEventListener();
x.off('eventName');
x.off();
x.destroy();
x.removeListener();
```

In the case of AngularJS's `$scope` subscriptions, add it to the destroy event:

```js
$scope.$on('$destroy', () => {
  removeEventListener();
});
```

Here is an example of where an unsubscribe happens in React class components:

```js
componentWillUnmount() {
  removeEventListener();
}
```
