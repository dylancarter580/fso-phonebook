const express = require('express')
const morgan = require('morgan')

const app = express()
app.use(express.json())
app.use(express.static('dist'))

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status - :response-time ms :body'))

// app.get('/', (request, response) => {
//   const api = `
//   <h1>API Docs for Phonebook Application</h1>
//   <p>GET /api/persons</p>
//   <p>GET /api/persons/{id}</p>
//   `
  
//   response.send(api)
// })

app.get('/info', (request, response) => {
  const info = `
  <p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date().toISOString()}
  `

  response.send(info)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)

  if (!person) {
    return response.status(404).json('person not found')
  }

  response.json(person)
})

const generateId = () => {
  return String(Math.floor(1000000 * Math.random()))
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: 'name exists already'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  
  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
