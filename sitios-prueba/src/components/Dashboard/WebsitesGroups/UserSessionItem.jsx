import { deleteUserSession } from '../../../services/dashboard';

export const UserSessionItem = ({ session }) => {
  const onDeleteClick = (sessionId) => {
    deleteUserSession(sessionId).then((response) => {
      //onDelete(sessionId);
      console.log('session deleted');
    });
  };

  return (
    <div className="flex my-4 items-center gap-1">
      <p>{session.email}</p>
      <div className="flex space-between">
        {session.samples.map((s) => (
          <div className="h-5 w-5 mx-1 rounded-3xl bg-green-700" />
        ))}
      </div>
      <button className="mx-1 underline text-blue-600">Ver</button>
    </div>
  );
};
