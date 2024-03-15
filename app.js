const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'userData.db')
app.use(express.json())
const bcrypt = require('bcrypt')
let db = null

const others = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running')
    })
  } catch (e) {
    console.log(`Database error : ${e}`)
  }
}

others()

app.post('/register', async (request, response) => {
  const {username, name, password, gender, location} = request.body
  const hashed = await bcrypt.hash(password, 10)
  const query = `SELECT * FROM user WHERE username='${username}';`
  const othwe = await db.get(query)
  if (othwe === undefined) {
    const vbn = `INSERT INTO user (username, name, password, gender, location)
    VALUES('${username}', '${name}', '${hashed}', '${gender}', '${location}')
    ;`
    if (password.length < 5) {
      response.send('Password is too short')
    } else {
      let newuserdetails = await db.run(vbn)
      response.status(200)
      response.send('User created successfully')
    }
  } else {
    response.status(400)
    response.send('User already exists')
  }
})

app.post('/login', async (request, response) => {
  const {username, password} = request.body
  const ogh = `SELECT * FROM user WHERE username='${username}';`
  const query = await db.get(ogh)

  if (ogh === undefined) {
    response.status(400)
    response.send('Invalid user')
  } else {
    const compares = await bcrypt.compare(password, query.password)
    if (compares === true) {
      response.send('Login success!')
    } else {
      response.status(400)
      response.send('Invalid password')
    }
  }
})

app.put('/change-password', async (request, response) => {
  const {username, oldPassword, newPassword} = request.body
  const querys = `SELECT * FROM user WHERE username='${username}';`
  const vb = await db.get(querys)
  if (vb === undefined) {
    response.status(400)
    response.send('Invalid current password')
  } else {
    const compressed = await bcrypt.compare(oldPassword, vb.newPassword)

    if (compressed === true) {
      const lengths = newPassword.length
      if (lengths < 5) {
        response.status(400)
        response.send('Password is too short')
      } else {
        const encryptedpassword = await bcrypt.hash(newPassword, 10)
        const updatedpassword = `update user SET password ='${encryptedpassword}' WHERE username ='${username}';`
        const othersc = await db.run(updatedpassword)
        response.send('Password updated')
      }
    } else {
      response.status(400)
      response.send('Invalid current password')
    }
  }
})

module.exports = express
