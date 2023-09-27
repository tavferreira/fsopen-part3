require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(morgan((tokens, req, res) => {
    morgan.token('body', (req, res) => JSON.stringify(req.body))
    
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        tokens.res(req, res, 'body'),
        tokens['body'](req, res)
    ].join(' ')
}))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const nameExists = (name) => persons.some(person => person.name === name)


app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</>`)
})

app.get('/api/persons', (request, response) => {
  Person
    .find()
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => next(error))
 
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ 
          error: 'name is missing' 
        })
    }

    if (!body.number) {
        return response.status(400).json({ 
          error: 'number is missing' 
        })
    }

    if (nameExists(body.name)) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    }) 
  
    person
      .save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
