import { useEffect, useState } from 'react';
import {useParams } from 'react-router-dom'
import { Loading } from '../../misc/Loading';
import { api } from '../../services/api';
// import api from '../../services/api'

import { Container, Owner } from './styles'

interface Repository {
    owner?: { avatar_url: string, login: string; }
    name?: string;
    description?: string;
}

type RepositoryState = Repository;

export const Repository = () => {
  const { repository: repositoryName } = useParams();
  const [repository, setRepository] = useState<RepositoryState>({});
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    (async () => { //SELF-INVOKING-FUNCTION
      const [repositoryData, issuesData] = await Promise.all([
        api.get<Repository>(`/repos/${repositoryName}`),
        api.get(`/repos/${repositoryName}/issues`, {
          params: {
            state: 'open',
            per_page: 5,
          }
        })
      ])

      setRepository(repositoryData.data)
      setIssues(issuesData.data)
      setLoading(false);
    })()
  }, [repositoryName])

  if (loading) {
    return <Loading />
  }

  return (
    <Container>
       <Owner>
        <img 
          src={repository.owner?.avatar_url} 
          alt={`${repository.owner?.login} avatar`}
        />
        <h1>{repository.name}</h1>
        <p>{repository.description}</p>
        <h1>{repositoryName}</h1>
       </Owner>
    </Container>
  )
}