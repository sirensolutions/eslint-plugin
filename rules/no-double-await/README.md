# Prevent two consecutive lines with await if they do not depend on each other


```js
const x = await getX();
const y = await getY();
``` 

Can be rewritten to be more efficient as 

```js
const [x,y] = await Promise.all([
  getX(),
  getY()
])
```

Sometimes we want the second line to actually be executed ONLY after first one is done 
In such case one can silence the rule 

```js
const x = await getX(); // eslint-disable-line siren/no-double-await
const y = await getY(); // eslint-disable-line siren/no-double-await
``` 
