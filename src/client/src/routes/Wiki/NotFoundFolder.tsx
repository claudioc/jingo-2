const NotFoundFolder: React.FC = () => {
  return (
    <>
      <h1>Folder not found</h1>
      <p>The folder at this URL does not exist (yet?) (error 404)</p>
      <p>Here is what you can do now:</p>
      <ul>
        <li>
          Go to the <a href="">home page</a>
        </li>
        <li>
          Create the folder by <a href="">following this link</a>
        </li>
      </ul>
    </>
  );
};

export default NotFoundFolder;
