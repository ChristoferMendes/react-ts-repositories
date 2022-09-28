import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa'

import { Container, Form, SubmitButton, List, DeleteButton } from './styles'
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface RepositoriesState {
    data: {
      name: string;
      url: string;
    }
}

interface Repository {
  full_name: string;
  html_url: string;
}


export const Main = () => {
  const [newRepo, setNewRepo] = useState('');
  const [repositories, setRepositories] = useState<RepositoriesState[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    const repoStorage = localStorage.getItem('repos');

    if (repoStorage) {
      setRepositories(JSON.parse(repoStorage) || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('repos', JSON.stringify(repositories))
  }, [repositories])

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();


    const Submit = async () => {
      setLoading(true);
      setAlert(false);
      try{

        if(newRepo === '') {
          throw new Error('You need to type a repository')
        }

        const response = await api.get<Repository>(`repos/${newRepo}`);

        const hasRepo = repositories.find(repo => repo.data.name.toUpperCase() === newRepo.toUpperCase()) 

        if (hasRepo) {
          console.log('hi');
          throw new Error('Repository diplicated')
        }


        const data = { name: response.data.full_name, url: response.data.html_url }
    
        setRepositories(prev => [...prev, { data }])
        setNewRepo('');
      } catch (error) {
        setAlert(true);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    Submit();

   
  }, [newRepo, repositories]);

  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRepo(e.target.value);
    setAlert(false);
  }

  const handleDelete = useCallback((repo: string) => {
    const find = repositories.filter(r => r.data.name !== repo);
    setRepositories(find);
  }, [repositories])


  return (
    <Container>
      <h1>
        <FaGithub size={25}/>
        My Repos
      </h1>

      <Form onSubmit={handleSubmit} error={alert ? 1 : 0}>
        <input type={'text'} placeholder={'Add repository'} value={newRepo} onChange={handleInputChange}></input>

        <SubmitButton loading={loading ? 1 : 0}>
          {loading ? (
            <FaSpinner color={'#fff'} size={14}/>
          ) : ( 
          <FaPlus color={'#fff'} size={14} /> 
          )}
        </SubmitButton>
      </Form>

      <List>
            {repositories.map((repo, index) => (
                <li key={index}>
                  <span>
                    <DeleteButton onClick={() => handleDelete(repo.data.name)}>
                      <FaTrash size={14}/>
                    </DeleteButton>
                    <a href={repo.data.url}>{repo.data.name}</a>
                    </span>
                  <Link to={`repository/${encodeURIComponent(repo.data.name)}`}>
                    <FaBars size={20} />
                  </Link>
                </li>
            ))}
      </List>
    </Container>
  )
}