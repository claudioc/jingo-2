import React from 'react';
import { http } from '@lib/http';
import { TDoc, TDocUpdate, TDocUpdated } from '@lib/types';
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
  const [loading, setLoading] = React.useState<boolean>();
  const [doc, setDoc] = React.useState<TDocUpdate>();
  const [form, setForm] = React.useState<FormSchema>({
    [FormFields.DocTitle]: '',
    [FormFields.Content]: '',
    [FormFields.Comment]: ''
  });

  const params = React.useMemo(() => new URLSearchParams(location.search), [location]);
  const docName = params.get('docName');

  const fetchWikiContent = React.useCallback(async () => {
    setLoading(true);
    const response = await http<TDocUpdate>('get', `/api/doc/update?docName=${docName}`);

    if (response.error || response.data === null) {
      console.error(`Something went wrong while fetching ${docName}`);
    } else {
      setDoc(response.data);
      setForm({ ...form, ..._pick(response.data, [FormFields.Content, FormFields.DocTitle]) });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchWikiContent();
  }, [fetchWikiContent]);

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

    const response = await http<TDocUpdated>('post', `/api/doc/update?docName=${docName}`, {
      data: {
        _csrf: doc.csrfToken,
        into: doc.into,
        docName: doc.docName,
        comment: form.comment,
        docTitle: form.docTitle,
        content: form.content
      }
    });

    const { docName: newDocName, into } = response.data!;

    navigate(`/wiki/${into}${newDocName}`);
  };

  if (loading) {
    return <span>Loading…</span>;
  }

  return (
    <div>
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
            required
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
    </div>
  );
};

export default Edit;
