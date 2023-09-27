import Person from './Person'

const Persons = ({persons, deletePerson}) => (
    <ul>
        {persons.map(person => <Person key={person.id} person={person} deletePerson={() => deletePerson(person)}/>)}
    </ul>
)

export default Persons
