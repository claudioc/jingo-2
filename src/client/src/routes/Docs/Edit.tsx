import React from 'react';
import { apiRequest } from '@lib/api-request';
import { IDocForUpdate, IDocLocation } from '@lib/types';
import { useNavigate } from 'react-router';
import _pick from 'lodash/pick';

enum FormFields {
  DocTitle = 'docTitle',
  Content = 'content',
  Comment = 'comment'
}

interface FormSchema {
  [FormFields.DocTitle]: string;
  [FormFields.Content]: string;
  [FormFields.Comment]?: string;
}

const Edit: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>();
  const [loading, setLoading] = React.useState<boolean>();
  const [doc, setDoc] = React.useState<IDocForUpdate>();
  const [form, setForm] = React.useState<FormSchema>({
    [FormFields.DocTitle]: '',
    [FormFields.Content]: '',
    [FormFields.Comment]: ''
  });

  const params = React.useMemo(() => new URLSearchParams(location.search), [location]);
  const docName = params.get('docName');
  const into = (params.get('into') ?? '').trim();

  const fetchDocContent = React.useCallback(async () => {
    setLoading(true);
    const response = await apiRequest<IDocForUpdate>(
      'get',
      `/api/doc/update?docName=${docName}&into=${into}`
    );

    if (response.error) {
      setError(`Something went wrong while fetching '${docName}': ${response.data.message}`);
    } else {
      setDoc(response.data);
      setForm({ ...form, ..._pick(response.data, [FormFields.Content, FormFields.DocTitle]) });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchDocContent();
  }, [fetchDocContent]);

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

    const response = await apiRequest<IDocLocation>('post', `/api/doc/update`, {
      data: {
        _csrf: doc.csrfToken,
        into: doc.into,
        docName: doc.docName,
        comment: form.comment,
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
      {error && <p>{error}</p>}
      {doc && (
        <form onSubmit={handleSubmit}>
          <p>
            <input
              required
              onChange={handleFormChange}
              name={FormFields.DocTitle}
              type="text"
              value={form.docTitle}
            />
          </p>
          <p>
            <textarea
              onChange={handleFormChange}
              name={FormFields.Content}
              rows={10}
              cols={80}
              value={form.content}
            />
          </p>
          <p>
            <input
              onChange={handleFormChange}
              name={FormFields.Comment}
              type="text"
              value={form.comment}
            />
          </p>
          <p>
            <input type="submit" value="Save" />
          </p>
        </form>
      )}
    </>
  );
};

export default Edit;
