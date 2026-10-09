import {useEffect, useState} from 'react';
import api from '../services/api';
export default function useResource(path) {
  const [state, setState] = useState({data: null, loading: true, error: ''});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {if (active) setState({data: null, loading: true, error: ''});});
    api.get(path).then(r => {if (active) setState({data: r.data.data, loading: false, error: ''});})
      .catch(e => {if (active) setState({data: null, loading: false, error: e.response?.data?.error?.message || 'تعذر تحميل المحتوى. تحقق من الاتصال وحاول مجددًا.'});});
    return () => {active = false;};
  }, [path, revision]);
  return {...state, retry: () => setRevision(n => n + 1)};
}
