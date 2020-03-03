"use strict";

// ----- Load requried modules
const { ApolloServer, gql } = require('apollo-server');
const { v4: uuid } = require('uuid');

// ----- Generate schema
const typeDefs = generate_schema();

// ----- Prepare data
var books = create_books();
var authors = create_authors();

// ----- Connect relationships
var books_to_authors = create_book_to_author();

// ----- Define resolvers
const resolvers = {
    Book: {
        author: book => find_author_by_book(book.id)
    },
    Author: {
        books: author => find_books_by_author(author.id)
    },
    Query: {
        books: (parent, args, context, info) => Object.values(books),
        authors: (parent, args, context, info) => Object.values(authors),
    },
    Mutation: {
        addBook: (parent, args, context, info) => {

            const author_list = authors.filter(author => author.name == args.author);
            const author = author_list.length > 0 ? author_list[0] : {
                id: uuid(),
                name: args.author,
            };

            const book = {
                id: uuid(),
                title: args.title,
            };

            const book_to_author = {
                book: book.id,
                author: author.id,
            };

            books.push(book);
            if (author_list.length == 0) {
                authors.push(author);
            }
            books_to_authors.push(book_to_author);

            return book;
        },
        removeBook: (parent, args, context, info) => {

            const book_list = books.filter(book => book.id == args.id);
            book_list.forEach(book => {
                books_to_authors = books_to_authors.filter(bta => bta.book != book.id);
                books = books.filter(b => b.id != book.id);
            });

            return book_list.length > 0 ? book_list[0] : null;
        }
    }
}

// ----- Build and start GraphQL server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    tracing: true,
});
server.listen({
    server: 'localhost',
    port: 8080
})
    .then(({ url }) => console.log(`The ApolloServer is ready at ${url}.`));

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
            id: uuid(),
            title: 'Title 1',
        },
        {
            id: uuid(),
            title: 'Title 2',
        },
        {
            id: uuid(),
            title: 'Title 3',
        }
    ];
}

function create_authors() {
    return [
        {
            id: uuid(),
            name: 'Foo Bar',
        },
        {
            id: uuid(),
            name: 'Hoge Hoge',
        }
    ];
}

// ----- Relationships

function create_book_to_author() {
    return [
        {
            book: books[0].id,
            author: authors[0].id,
        },
        {
            book: books[1].id,
            author: authors[0].id,
        },
        {
            book: books[2].id,
            author: authors[1].id,
        }
    ];
}

function find_author_by_book(book_id) {
    const author_id_list = books_to_authors.filter(link => link.book == book_id).map(link => link.author);
    const author_list = authors.filter(author => author_id_list.includes(author.id));
    return author_list.length == 1 ? author_list[0] : null;
}

function find_books_by_author(author_id) {
    const book_id_list = books_to_authors.filter(link => link.author == author_id).map(link => link.book);
    return books.filter(book => book_id_list.includes(book.id));
}
