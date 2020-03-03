"use strict";

// ----- Load requried modules
const { ApolloServer, gql } = require('apollo-server');

// ----- Generate schema
const typeDefs = generate_schema();

// ----- Prepare data
const books = create_books();
const authors = create_authors();

// ----- Connect relationships
const book_to_author = create_book_to_author();

// ----- Define resolvers
const resolvers = {
    Book: {
        author: book => find_author_by_book(book.id)
    },
    Author: {
        books: author => find_books_by_author(author.id)
    },
    Query: {
        books: () => Object.values(books),
        authors: () => Object.values(authors),
    },
    Mutation: {
        addBook: async () => {

        },
        removeBook: async () => {

        }
    }
}

// ----- Build and start GraphQL server
const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ server: 'localhost', port: 8080 }).then(({ url }) => console.log(`The ApolloServer is ready at ${url}.`));

// ----- End of main function
//
//
//
// ----- Sub procesures

// ----- Schema declaration

function generate_schema() {
    return gql`
    
        # ----------
        # types
        # ----------
        type Book {
            id: ID 
            title: String
            author: Author
        }
        type Author {
            id: ID
            name: String
            books: [Book]
        }

        # ----------
        # entry points for query
        # ----------
        type Query {
            books: [Book]
            authors: [Author]
        }

        # ----------
        # modify operations
        # -----------
        type Mutation {
            addBook(title: String!, author: String!): Book
            removeBook(id: ID!): Book
        }
    `;
}

// ----- Types

function create_books() {
    return [
        {
            id: 1,
            title: 'Title 1',
        },
        {
            id: 2,
            title: 'Title 2',
        },
        {
            id: 3,
            title: 'Title 3',
        }
    ];
}

function create_authors() {
    return [
        {
            id: 1,
            name: 'Foo Bar',
        },
        {
            id: 2,
            name: 'Hoge Hoge',
        }
    ];
}

// ----- Relationships

function create_book_to_author() {
    return [
        {
            book: 1,
            author: 1,
        },
        {
            book: 2,
            author: 1,
        },
        {
            book: 3,
            author: 2,
        }
    ];
}

function find_author_by_book(book_id) {
    const author_id_list = book_to_author.filter(link => link.book == book_id).map(link => link.author);
    const author_list = authors.filter(author => author_id_list.includes(author.id));
    return author_list.length == 1 ? author_list[0] : null;
}

function find_books_by_author(author_id) {
    const book_id_list = book_to_author.filter(link => link.author == author_id).map(link => link.book);
    return books.filter(book => book_id_list.includes(book.id));
}
