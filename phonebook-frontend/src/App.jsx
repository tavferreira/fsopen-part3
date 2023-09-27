import { useState, useEffect } from 'react'
import Persons from './components/Persons'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import personService from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationType, setNotificationType] = useState(null)

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const setNotification = (message, type) => {
    setNotificationMessage(message)
    setNotificationType(type)
  }

  const clearNotification = () => {
    return setTimeout(() => {
      setNotificationMessage(null)
      setNotificationType(null)
    }, 5000)
  }

  const clearInputs = () => {
    setNewName('')
    setNewNumber('')
  }

  const sendToServer = (person) => personService
                                    .create(person)
                                    .then(returnedPerson => {
                                      setPersons(persons.concat(returnedPerson))
                                      clearInputs()
                                      setNotification(`Added ${returnedPerson.name}`,'info')
                                      clearNotification()
                                    })

  const updatePerson = (personToUpdate) => {
    if(window.confirm(`${personToUpdate.name} is already added to the phonebook, replace the old number with a new one?`)) {
      personService
        .update(personToUpdate)
        .then(updatedPerson => {
          const newPersons = persons.map(person => person.id !== personToUpdate.id ? person : updatedPerson)
          setPersons(newPersons)
        })
      clearInputs()
    }
  }

  const addPerson = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    const newPerson = {...existingPerson, name: newName, number: newNumber}
    existingPerson ? updatePerson(newPerson) : sendToServer(newPerson)  
  }

  const deletePerson = (personToDelete) => {
    if(window.confirm(`Delete ${personToDelete.name}?`)) {
      personService
          .erase(personToDelete.id)
          .then(() => setPersons(persons.filter(person => person.id !== personToDelete.id)))
          .catch(() => {
            setNotification(`Information of ${personToDelete.name} has already been deleted from server`,'error')
            clearNotification()
            setPersons(persons.filter(n => n.id !== personToDelete.id))
          })
    }
}

  const handlePersonChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)
  
  const filterPersons = (person) => person.name.toLowerCase().includes(filter.toLowerCase())
  const personsToShow = filter ? persons.filter(filterPersons) : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notificationMessage} type={notificationType} />
      <Filter filter={filter} handleFilterChange={handleFilterChange} />
      <h3>Add a new</h3>
      <PersonForm onSubmit={addPerson} nameValue={newName} nameOnChange={handlePersonChange} numberValue={newNumber} numberOnChange={handleNumberChange}/>
      <h3>Numbers</h3>
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App
