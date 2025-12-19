import { useEffect, useState } from 'react'
import personService from './services/personService'
import './App.css'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [filter, setFilter] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const addPerson = (event) => {
    event.preventDefault()
    const newPerson = { name: newName, number: newNumber }
    const person = persons.find((person) => person.name === newName);

    if (person) {
      if (window.confirm(`${newName} is already added to the phonebook, replace the old number with a new one?`)) {
        personService
          .update(person.id, newPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== person.id ? p : returnedPerson))
            setNewName('')
            setNewNumber('')
          })
          .catch((error) => {
            setError(`Information of ${newPerson.name} has already been removed from server`)
            setTimeout(() => {
              setError(null)
            }, 5000)
            setNewName('')
            setNewNumber('')
          })
      }
    } else {
      personService 
      .create(newPerson)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson))
        setNotification(`Added ${returnedPerson.name}`)
        setTimeout(() => {
          setNotification(null)
        }, 5000)
        setNewName('')
        setNewNumber('')
      })
      .catch((error) => {
        console.log(error)
      })
    }
  }

  
  const deletePerson = (id) => {
    personService
      .remove(id)
      .then(() => {
        setPersons(persons.filter((person) => person.id !== id))
      })
  }

  const handleFilterChange = (event) => setFilter(event.target.value)
  const handleNewNameChange = (event) => setNewName(event.target.value)
  const handleNewNumberChange = (event) => setNewNumber(event.target.value)

  useEffect(() => {
    personService
      .getAll()
      .then(persons => {
        setPersons(persons)
      })
  }, [])


  return (
    <div>
      <Notification message={notification}/>
      <Error message={error} />
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={handleFilterChange}/>
      <h2>add a new</h2>
      <PersonForm newName={newName} newNumber={newNumber} addPerson={addPerson} handleNewNameChange={handleNewNameChange} handleNewNumberChange={handleNewNumberChange}/>
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} deletePerson={deletePerson}/>
    </div>
  )
}

const Filter = ({filter, handleFilterChange}) => <div>filter shown with <input value={filter} onChange={handleFilterChange}/></div>


const PersonForm = ({newName, newNumber, addPerson, handleNewNameChange, handleNewNumberChange}) => {
  return (
    <>
      <form onSubmit={addPerson}>
        <div>
          name: <input value={newName} onChange={handleNewNameChange}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNewNumberChange}/>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </>
  )
}

const Persons = ({persons, filter, deletePerson}) => {
  const personsToShow = persons.filter(person => 
    person.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <ul>
      {personsToShow.map((person) => (
        <li key={person.id}>
          {person.name} {person.number}
          <button onClick={() => {
            if (confirm(`Delete ${person.name}?`)) {
              deletePerson(person.id)
            }
          }}>
            delete
          </button>
        </li>
      ))}
    </ul>
  ) 
}

const Notification = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className="notification">
      {message}
    </div>
  )
}

const Error = ({ message }) => {
  if (message === null) {
    return null;
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}

export default App