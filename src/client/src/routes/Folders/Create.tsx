import React from 'react';
import { apiRequest } from '@lib/api-request';
import { IFolderForCreate, IFolderLocation } from '@lib/types';
import { useNavigate } from 'react-router';
import _pick from 'lodash/pick';
import { Link } from 'react-router-dom';
import { useAppState } from '@/AppState';

enum FormFields {
  FolderName = 'folderName'
}

interface FormSchema {
  [FormFields.FolderName]: string;
}

const Create: React.FC = () => {
  const appState = useAppState();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>();
  const [folder, setFolder] = React.useState<IFolderForCreate>();
  const [form, setForm] = React.useState<FormSchema>({
    [FormFields.FolderName]: ''
  });

  const params = React.useMemo(() => new URLSearchParams(location.search), [location]);
  const folderName = (params.get('folderName') ?? '').trim();
  const into = (params.get('into') ?? '').trim();

  const fetchFolderForCreate = React.useCallback(async () => {
    setLoading(true);
    const response = await apiRequest<IFolderForCreate>(
      'get',
      `/api/folder/create?folderName=${folderName}`
    );

    if (response.error) {
      setError(`Something went wrong while creating '${folderName}'`);
    } else {
      setFolder(response.data);
      setForm({ ...form, ..._pick(response.data, [FormFields.FolderName]) });
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchFolderForCreate();
  }, [fetchFolderForCreate]);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!folder) {
      return;
    }

    const response = await apiRequest<IFolderLocation>('post', `/api/folder/create`, {
      data: {
        _csrf: folder.csrfToken,
        into: folder.into,
        folderName: form.folderName
      }
    });

    if (response.error) {
      setError(`Something went wrong while saving the folder: ${response.data.message}`);
    } else {
      const { folderPath } = response.data;
      navigate(folderPath);
    }
  };

  if (loading) {
    return <span>Loading…</span>;
  }

  return (
    <>
      <h2>Creating {`${folderName ? folderName : 'a new folder'}`}</h2>
      {error && <p>{error}</p>}
      {folder && (
        <form onSubmit={handleSubmit}>
          <p>
            <label htmlFor="folder-name">Name</label>
            <input
              id="folder-name"
              required
              onChange={handleFormChange}
              name={FormFields.FolderName}
              type="text"
              value={form.folderName}
            />
          </p>
          <p>
            <input type="submit" value="Save" />
            or
            <Link to={`/wiki/${into}`}>Cancel</Link>
          </p>
        </form>
      )}
    </>
  );
};

export default Create;
