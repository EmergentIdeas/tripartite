var tri = require('./tripartite')

var hello = tri.pt("hello, __name__!")
console.log(hello({name: 'Dan'}))
