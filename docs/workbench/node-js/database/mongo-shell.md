# MongoDB shell reference

After connecting, these commands run inside the interactive MongoDB shell.

Inspect the server and select a database:

```js
show dbs
use learning_db
db.getName()
show collections
db.stats()
```

`use learning_db` selects the database, but MongoDB creates it only after the first write. Collections can also be created explicitly:

```js
db.createCollection('products')
show collections
```

Insert documents:

```js
db.products.insertOne({ name: 'Coffee', price: 5, stock: 10 })

db.products.insertMany([
  { name: 'Tea', price: 4, stock: 20, category: 'drinks' },
  { name: 'Cake', price: 7, stock: 5, category: 'food' },
])
```

Read and filter documents:

```js
// Return every product.
db.products.find()

// Return the first matching product.
db.products.findOne({ name: 'Coffee' })

// Comparison operators: greater than or equal and less than.
db.products.find({ price: { $gte: 5, $lt: 10 } })

// Match one of several values.
db.products.find({ category: { $in: ['drinks', 'food'] } })

// Sort by price descending and return at most five documents.
db.products.find().sort({ price: -1 }).limit(5)

// Projection: include only name and price; omit _id.
db.products.find({}, { _id: 0, name: 1, price: 1 })

// Count matching documents and list distinct field values.
db.products.countDocuments({ price: { $gte: 5 } })
db.products.distinct('category')
```

Update documents:

```js
db.products.updateOne(
  { name: 'Coffee' },
  { $set: { price: 6 } },
)

// Atomically increment a numeric field.
db.products.updateOne(
  { name: 'Coffee' },
  { $inc: { stock: -1 } },
)

// Add a field to all matching documents.
db.products.updateMany(
  { category: 'drinks' },
  { $set: { available: true } },
)
```

Delete documents:

```js
db.products.deleteOne({ name: 'Coffee' })

// deleteMany removes every matching document; inspect with find() first.
db.products.find({ available: false })
db.products.deleteMany({ available: false })
```

Inspect and manage indexes:

```js
// Every collection automatically has a unique _id index.
db.products.getIndexes()

// Create a single-field index.
db.products.createIndex({ name: 1 })

// Create a compound index matching category + descending price queries.
db.products.createIndex({ category: 1, price: -1 })

// Show how MongoDB plans and executes a query.
db.products.find({ category: 'drinks' })
  .sort({ price: -1 })
  .explain('executionStats')
```

Inspect a collection and leave the shell:

```js
db.products.stats()
exit
```

Destructive shell commands should be used deliberately:

```js
// Delete every document in the collection but keep the collection/indexes.
db.products.deleteMany({})

// Delete the entire collection and its indexes.
db.products.drop()

// Delete the currently selected database.
db.dropDatabase()
```

Before running `deleteMany({})`, `drop()`, or `dropDatabase()`, verify the active database with `db.getName()`.

A database and collection can be created implicitly by the first write. For production setup, explicit migrations or initialization scripts make intent clearer.
