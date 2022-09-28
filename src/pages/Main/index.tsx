import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { FaGithub, FaPlus, FaSpinner, FaBars, FaTrash } from 'react-icons/fa'

import { Container, Form, SubmitButton, List, DeleteButton } from './styles'
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface RepositoriesState {
    data: {
      name: string;
    }
    name?: string;
}

interface User {
  full_name: string;
}


export const Main = () => {
  const [newRepo, setNewRepo] = useState('');
  const [repositories, setRepositories] = useState<RepositoriesState[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    const repoStorage = localStorage.getItem('repos');

    if (repoStorage) {
      setRepositories(JSON.parse(repoStorage))
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

        const response = await api.get<User>(`repos/${newRepo}`);

        const hasRepo = repositories.find(repo => repo.data.name.toUpperCase() === newRepo.toUpperCase()) 

        if (hasRepo) {
          console.log('hi');
          throw new Error('Repository diplicated')
        }


        const data = { name: response.data.full_name }
    
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

  const handleDelete = useCallback((repo: any) => {
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
                    {repo.data.name}
                    </span>
                  <Link to={`repository/${repo.data.name}`}>
                    <FaBars size={20}/>
                  </Link>
                </li>
            ))}
      </List>
    </Container>
  )
}