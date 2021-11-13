import React from 'react';
import { apiRequest } from '@lib/api-request';
import { IDocForCreate, IDocLocation } from '@lib/types';
import { useNavigate } from 'react-router';
import _pick from 'lodash/pick';
import { Link } from 'react-router-dom';

enum FormFields {
  DocTitle = 'docTitle',
  Content = 'content'
}

interface FormSchema {
  [FormFields.DocTitle]: string;
  [FormFields.Content]: string;
}

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>();
  const [doc, setDoc] = React.useState<IDocForCreate>();
  const [form, setForm] = React.useState<FormSchema>({
    [FormFields.DocTitle]: '',
    [FormFields.Content]: ''
  });

  const params = React.useMemo(() => new URLSearchParams(location.search), [location]);
  const docTitle = (params.get('docTitle') ?? '').trim();
  const into = (params.get('into') ?? '').trim();

  const fetchDocForCreate = React.useCallback(async () => {
    setLoading(true);
    const response = await apiRequest<IDocForCreate>(
      'get',
      `/api/doc/create?docTitle=${docTitle}&into=${into}`
    );

    if (response.error) {
      setError(`Something went wrong while creating '${docTitle}'`);
    } else {
      setDoc(response.data);
      setForm({ ...form, ..._pick(response.data, [FormFields.DocTitle]) });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDocForCreate();
  }, [fetchDocForCreate]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!doc) {
      return;
    }

    const response = await apiRequest<IDocLocation>('post', `/api/doc/create`, {
      data: {
        _csrf: doc.csrfToken,
        into: doc.into,
        docTitle: form.docTitle,
        content: form.content
      }
    });

    if (response.error) {
      setError(`Something went wrong while saving the document: ${response.data.message}`);
    } else {
      const { wikiPath } = response.data;
      navigate(wikiPath);
    }
  };

  if (loading) {
    return <span>Loading…</span>;
  }

  return (
    <>
      <h2>Creating {`${docTitle ? docTitle : 'a new document'}`}</h2>
      {error && <p>{error}</p>}
      {doc && (
        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="doc-title">Title</label>
            <input
              id="doc-title"
              required
              onChange={handleFormChange}
              name={FormFields.DocTitle}
              type="text"
              value={form.docTitle}
            />
          </p>
          <p>
            <label htmlFor="doc-content">Content</label>
            <textarea
              id="doc-content"
              onChange={handleFormChange}
              name={FormFields.Content}
              rows={10}
              cols={80}
              value={form.content}
            />
          </p>
          <p>
            <input type="submit" value="Save" />
            or
            <Link to={doc.wikiPath}>Cancel</Link>
          </p>
        </form>
      )}
    </>
  );
};

export default Create;
