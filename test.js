var tri = require('./tripartite')

var hello = tri.pt("hello, __name__!")
console.log("Should be: hello, Dan!")
console.log(hello({name: 'Dan'}))

var hello = tri.pt("hello, __cond??name__!")
console.log("\nShould be: hello, Dan!")
console.log(hello({name: 'Dan', cond: true}))
console.log("\nShould be: hello, !")
console.log(hello({name: 'Dan', cond: false}))

tri.addTemplate('stars', '**__this__**')
tri.addTemplate('wonder', 'wonder')
var hello = tri.pt("hello, __cond??name::stars__!")
console.log("\nShould be: hello, **Dan**!")
console.log(hello({name: 'Dan', cond: true}))
console.log("\nShould be: hello, !")
console.log(hello({name: 'Dan', cond: false}))

var blankData = tri.pt('some __::wonder__')
console.log("\nShould be: some wonder")
console.log(blankData('blank'))

var blankData = tri.pt('some __::stars__')
console.log("\nShould be: some **blank**")
console.log(blankData('blank'))


var tri2 = tri.createBlank()
var nostars = tri2.pt('no stars __::stars__')
try {
	console.log(nostars())
} catch(e) {
	console.log('\nmissing template, correct behavior')
}
