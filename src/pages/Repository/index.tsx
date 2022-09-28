import { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import {useParams } from 'react-router-dom'
import { TypeAnimation } from 'react-type-animation';
import { Loading } from '../../misc/Loading';
import { api } from '../../services/api';
// import api from '../../services/api'

import { BackButton, Container, IssuesList, Owner, PageActions, StateFilter } from './styles'

interface Repository {
    owner?: { avatar_url: string, login: string; }
    name?: string;
    description?: string;
    html_url?: string;
}

interface Issues {
  id: number;
  user: { avatar_url: string, login: string }
  title: string;
  html_url: string;
  labels: [{id: number, name: string}];
}

type RepositoryState = Repository;

export const Repository = () => {
  const { repository: repositoryName } = useParams();
  const [repository, setRepository] = useState<RepositoryState>({});
  const [issues, setIssues] = useState<Issues[]>([])
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [issueState, setIssueState] = useState([
    {state: 'all', label: 'All', active: true},
    {state: 'open', label: 'Open', active: false},
    {state: 'closed', label: 'Closed', active: false}
  ])
  const [issueFocus, setIssueFocus] = useState(0);
  const [cursor, setCursor] = useState(true);
  
  useEffect(() => {
    (async () => { //SELF-INVOKING-FUNCTION
      const [repositoryData, issuesData] = await Promise.all([
        api.get<Repository>(`/repos/${repositoryName}`),
        api.get(`/repos/${repositoryName}/issues`, {
          params: {
            state: issueState.find(a => a.active)?.state,
            per_page: 5,
          }
        })
      ])

      setRepository(repositoryData.data)
      setIssues(issuesData.data)
      setLoading(false);
    })()
  }, [repositoryName])

  useEffect(() => {
    (async () => {
      const response = await api.get(`/repos/${repositoryName}/issues`, {
        params: {
          state: issueState[issueFocus].state,
          page,
          per_page: 5,
        }
      })

      setIssues(response.data)
    })()
  }, [repositoryName, page, issueState, issueFocus])

  const handlePage = (action: string) => {
    setPage(action === 'back' ? page - 1 : page + 1)
  }
  
  const handleIssueFilter = (index: number) => {
    setIssueFocus(index);
  }

  if (loading) {
    return <Loading />
  }

  return (
    <Container>
      <BackButton to={'/'}> 
        <FaArrowLeft color='#000' size={30} />
      </BackButton>
  
       <Owner>
        <img 
          src={repository.owner?.avatar_url} 
          alt={`${repository.owner?.login} avatar`}
        />
        <h1>
          <a href={repository.html_url} target='_blank'>{repositoryName}</a>
        </h1>
        <div>
          <TypeAnimation 
            sequence={[
              `What ${repository.name} repository is about?`,
              300,
              `${repository.description}`,
              500,
              () => {
                setCursor(false)
              }
            ]}
            wrapper={'div'}
            cursor={cursor}
          />
        </div>
       </Owner>

      <StateFilter active={issueFocus}>
        {issueState.map((row, index) => (
          <button 
          type='button' 
          key={row.label}
          onClick={() => handleIssueFilter(index)}>{row.label}</button>
        ))}
      </StateFilter>
        
      
       <IssuesList>
        
        {issues.map(issue => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />

            <div>
              <strong>
                <a href={issue.html_url} target='_blank'>{issue.title}</a>

                {issue.labels.map(label => (
                  <span key={label.id.toString()}>{label.name}</span>
                ))}
              </strong>
              <p>{issue.user.login}</p>
            </div>
          </li>
        ))}
       </IssuesList>

       <PageActions>
          <button 
          type='button' 
          onClick={() => handlePage('back')}
          disabled={page < 2}
          >
            Previous
          </button>
          <button type='button' onClick={() => handlePage('next')}>Next</button>
       </PageActions>
    </Container>
  )
}