export const Book = ({ title, img, author }) => (
  <div className="w-36 my-6">
    <img src={img} className="h-52 w-full" alt="..." />
    <div className="card-body">
      <h6 className="text-center my-1">{title}</h6>
      <p className="text-center text-gray-500 text-sm">{author}</p>
    </div>
  </div>
);
