const express = require('express')
const app = express()
const { graphqlHTTP } = require('express-graphql')

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} = require('graphql')

const authors = [
  {id: 1, name: 'Adam Mickiewicz'},
  {id: 2, name: 'Bahumus'},
  {id: 3, name: 'Zbyszek Wodecki'},
]

const books = [
  {id: 1, title: 'Pan Tadeusz', authorId: 1},
  {id: 2, title: 'Dziady 3', authorId: 1},
  {id: 3, title: 'Zmierzch', authorId: 2},
  {id: 4, title: 'Chałupy', authorId: 3},
]

app.listen(5000, () => console.log('listening...'))

app.get('/api/books', (req, res) => {
  res.send(books)
})

app.get('/api/authors/:id', (req, res) => {
  res.send(authors.find(a => a.id = req.params.id))
})

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields: {
    id: {type: GraphQLNonNull(GraphQLID) },
    name: {type: GraphQLNonNull(GraphQLString) },
  }
})

const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: {
    id: {type: GraphQLNonNull(GraphQLID) },
    title: {type: GraphQLNonNull(GraphQLString) },
    authorId: {type: GraphQLNonNull(GraphQLID) },
    author: {
      type: AuthorType,
      resolve(book) {
        return authors.find(a => a.id === book.authorId)
      }
    },
  }
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      books: {
        type: new GraphQLList(BookType),
        args: {
          id: {type: GraphQLInt},
          title: {type: GraphQLString},
        },
        resolve(parent, args) {
          if (args.title) {
            return books.filter(book => args.title === book.title)
          } else if (args.id) {
            return books.filter(book => args.id === book.id)
          } else {
            return books
          }
        },
      },
    },
  }),
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  }),
)
