require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('dist'))

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status - :response-time ms :body'))

app.get('/info', (request, response) => {
  let personsLen = 0
  Person.find({}).then(persons => {
    const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toISOString()}
  `

    response.send(info)
  })

})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => response.json(persons))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id) 
    .then(person => {
      if (!person) {
        response.status(404).end()
      } else {
        response.json(person)
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number ) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const person = Person({
    name: name,
    number: number
  })

  person.save()
    .then(newPerson => {
      response.json(newPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save()
              .then(response.json(person))
              .catch(error => next(error))
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id) 
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorMiddleware = (error, request, response, next) => {
  console.error(error)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }

  next(error)
}
app.use(errorMiddleware)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
