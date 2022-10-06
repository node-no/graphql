const express = require("express");
const expressGraphql = require("express-graphql");
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLSchema,
} = require("graphql");
const { authors, books } = require("./data");

// graphql config
const BookType = new GraphQLObjectType({
  name: "Book",
  description: "This represents a book written by author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: {
      type: AuthorType,
      resolve: (book) => authors.find((item) => item.id == book.authorId),
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "An Author",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => books.filter((item) => item.authorId == author.id),
    },
  }),
});

// root
const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  description: "Root query for books and authors",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => books.find((item) => item.id == args.id),
    },
    books: {
      type: GraphQLList(BookType),
      resolve: () => books,
    },
    authors: {
      type: GraphQLList(AuthorType),
      resolve: () => authors,
    },
  }),
});

const RootMutationType=  new GraphQLObjectType({
    name: "RootMutation",
    description: "Root mutation",
    fields:{
        addBook: {
            type: BookType,
            description: "Add a new book",
            args: {
                name:{ type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve:(parent,args)=>{
                const book= {
                    id: books.length+1,
                    ...args
                }

                books.push(book)
                return book
            }
        }
    }
})

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
});

// app
const app = express();

app.use(
  "/graphql",
  expressGraphql.graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(3000, () => console.log("App is runnning on port 3000..."));
