const express = require("express");
const { ApolloServer, gql } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");

const MyBooks = require("./book");
const Myseller = require("./seller");

async function start() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  const server = new ApolloServer({
    typeDefs: `
      type Seller {
        provider_id: Int!
        name: String!
      }
      type Book {
        author: String
        book_name: String
        publish_year: Int
        provider_id: Int
        seller: Seller
      }

      type Query {
        getallbooks: [Book]
        getbook(id: Int!): Book
        getallSeller: [Seller]
      }
    `,
    resolvers: {
      Book: {
        seller: (book) =>
          Myseller.providers.find(
            (Seller) => Seller.provider_id === book.provider_id
          ),
      },
      Query: {
        getallbooks: () => MyBooks.books,
        getbook: (parent, { id }) =>
          MyBooks.books.find(
            (book) => book.publish_year === id || book.provider_id === id
          ),
        getallSeller: () => Myseller.providers,
      },
    },
    introspection: true,
  });
  await server.start();
  app.use("/graphql", expressMiddleware(server));
  app.listen({ port: 4000 }, () => {
    console.log(` Server ready at http://localhost:4000`);
  });
}

start();
