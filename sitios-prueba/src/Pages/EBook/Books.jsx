import { useState } from 'react';
import { Book } from '../../components/EBook/Book';
import { books } from './books_data';
import { Link } from 'react-router-dom';

export const Books = () => {
  const [targetBook, setTargetBook] = useState(null);

  const handleAddItem = (book) => {
    setTargetBook(book);
    setTimeout(() => {
      setTargetBook(null);
    }, 6000);
  };

  return (
    <div className="grid my-8 grid-cols-4 justify-items-center">
      {books.map((book, i) => (
        <Book key={i} book={book} onItemAdd={handleAddItem} />
      ))}
      {targetBook && (
        <div className="fixed bottom-4 right-4 bg-white border rounded border-fuchsia-500 p-4 flex gap-2 items-center">
          <p className="text-lg text-gray-700">
            Se agregó "{targetBook.title}".
          </p>
          <Link
            to="/ebook/cart"
            className="text-fuchsia-500 font-bold underline"
          >
            Ver carrito
          </Link>
        </div>
      )}
    </div>
  );
};
