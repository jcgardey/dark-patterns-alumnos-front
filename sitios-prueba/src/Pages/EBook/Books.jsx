import { Book } from '../../components/EBook/Book';
import { books } from './books_data';

export const Books = () => (
  <div className="grid my-8 grid-cols-5 justify-items-center">
    {books.map((book, i) => (
      <Book key={i} title={book.title} img={book.img} author={book.author} />
    ))}
  </div>
);
