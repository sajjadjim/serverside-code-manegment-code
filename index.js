const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://coffee_server:zSUMjmOzDeU2hpvc@sajjadjim15.ac97xgz.mongodb.net/?retryWrites=true&w=majority&appName=SajjadJim15`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const databaseCollections = client.db('doctor_manegment_system').collection('users')

    // Add Coffee Data new here Logic Write 
    app.post('/users', async (req, res) => {
      const newUser = req.body
      console.log(newUser)
      const result = await databaseCollections.insertOne(newUser)
      res.send(result)
    })
   
    // Update user Data in single row ------------------------------------
    // ------------------------------------------------------------------------
    app.put('/users/:id' , async(req, res)=>{
      const id = req.params.id
      const filterData = {_id : new ObjectId(id)}
      const options = { upsert : true};
      // Full object Taken Here 
      const updatedUser = req.body

      const updatedDoc = {
        $set : updatedUser
      } 
      const result = await databaseCollections.updateOne(filterData ,updatedDoc , options)
      res.send(result)
    })
// ----------------------------------------------------------------------------------------------------------
    //  ALL Data taken from Database 
    app.get('/users', async (req, res) => {
      const result = await databaseCollections.find().toArray();
      res.send(result)
    })


app.patch('/users/:email', async (req, res) => {
  try {
    const email = req.params.email; // use email instead of ObjectId
    const updates = req.body;

    const filter = { email }; // filter by email
    const updateDoc = { $set: updates };

    const result = await databaseCollections.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
      return res.status(404).send({ error: "User not found" });
    }

    const updatedUser = await databaseCollections.findOne(filter);
    res.send(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to update user", details: err.message });
  }
});



    //  single items Find here __________________________
    app.get('/users/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await databaseCollections.findOne(query)
      res.send(result)
    })


    app.post('/users', async (req, res) => {
        try {
            const user = req.body;
            if (!user.name || !user.email) {
                return res.status(400).send({ error: "Name and email are required" });
            }
            const result = await databaseCollections.insertOne(user);
            res.status(201).send({ message: "User added successfully", result });
        } catch (err) {
            console.error(err);
            res.status(500).send({ error: "Failed to add user", details: err.message });
        }
    });

    // Inside your run() function, after const databaseCollections = ...
const appointmentsCollection = client
  .db('doctor_manegment_system')
  .collection('appointments');

// POST route to book appointment
app.post('/appointments', async (req, res) => {
  try {
    const appointment = req.body;

    // Optional: basic validation
    if (
      !appointment.doctorId ||
      !appointment.doctorName ||
      !appointment.doctorEmail ||
      !appointment.patientName ||
      !appointment.patientEmail ||
      !appointment.appointmentDate ||
      !appointment.appointmentTime
    ) {
      return res.status(400).send({ error: "All fields are required" });
    }

    const result = await appointmentsCollection.insertOne(appointment);
    res.status(201).send({ message: "Appointment booked successfully", result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to book appointment", details: err.message });
  }
});

app.get('/appointments/patient', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ error: "Email parameter is required" });
        }
        // Find all appointments where doctorEmail or patientEmail matches the provided email, sorted by appointmentDate (descending)
        const appointments = await appointmentsCollection.find({
            $or: [
                { doctorEmail: email },
                { patientEmail: email }
            ]
        })
        .sort({ appointmentDate: -1 }) // Sort by date, newest first
        .toArray();
        res.send(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch appointments by email" });
    }
});

app.get('/appointments/doctor', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send({ error: "Email parameter is required" });
        }
        // Find all appointments where doctorEmail or patientEmail matches the provided email, sorted by appointmentDate (descending)
        const appointments = await appointmentsCollection.find({
            $or: [
                { doctorEmail: email },
                { patientEmail: email }
            ]
        })
        .sort({ appointmentDate: -1 }) // Sort by date, newest first
        .toArray();
        res.send(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch appointments by email" });
    }
});


// Optional: get all appointments (for testing / admin)
app.get('/appointments', async (req, res) => {
  try {
    const result = await appointmentsCollection.find().toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch appointments" });
  }
});

app.get('/users/popular/doctors', async (req, res) => {
    try {
        const doctors = await databaseCollections
            .find({ role: 'doctor' })
            .sort({ popularity: -1 }) // Assumes a 'popularity' field exists
            .limit(6)
            .toArray();
        res.send(doctors);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to fetch popular doctors" });
    }
});

app.get('/users/email=:email', async (req, res) => {
    try {
        const email = req.params.email;
        if (!email) {
            return res.status(400).send({ error: "Email parameter is required" });
        }
        const user = await databaseCollections.findOne({ email: email });
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.send(user);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to search user by email" });
    }
});


app.get('/users/count/patients', async (req, res) => {
    try {
        const count = await databaseCollections.countDocuments({ role: 'patient' });
        res.send({ patientsCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to count patients" });
    }
});

app.get('/users/count/doctors', async (req, res) => {
    try {
        const count = await databaseCollections.countDocuments({ role: 'doctor' });
        res.send({ doctorsCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to count doctors" });
    }
});

app.get('/appointments/count', async (req, res) => {
    try {
        const count = await appointmentsCollection.countDocuments();
        res.send({ appointmentsCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Failed to count appointments" });
    }
});


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Coffee is hoster than server !!!')
})

app.listen(port, () => {
  console.log(`Management server is running on port ${port}`)
})