const Welcome: React.FC = () => {
  return (
    <>
      <h1>Welcome to Jingo</h1>
      <p>
        You are reading this page either because your document repository (<em></em>) is completely
        empty, or the document that you have defined as the &quot;index&quot; (<em></em>)
        doesn&apos;t exist yet or you configured it wrong.
      </p>

      <p>Please select one of the following options</p>

      <ul>
        <li>
          <a href="">
            I want to create the <em></em> document
          </a>
        </li>
        <li>
          <a href="">I want to see document list document</a>
        </li>
        <li>
          <a href="/">I fixed the mistake, let&apos;s try again</a>
        </li>
      </ul>
    </>
  );
};

export default Welcome;
