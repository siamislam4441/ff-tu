const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const app = express();

// ১. ডাটাবেস কানেকশন (সংশোধিত লিঙ্ক)
const mongoURI = 'mongodb+srv://siam00:siam1122@cluster0.kzvfjvz.mongodb.net/ff_tournament?retryWrites=true&w=majority';
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to Online MongoDB"))
    .catch(err => console.log("DB Connection Error: ", err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ২. ডাটাবেস মডেল
const tournamentSchema = new mongoose.Schema({
    title: String,
    fee: Number,
    status: { type: String, default: 'Upcoming' },
    roomID: String,
    roomPass: String
});
const Tournament = mongoose.model('Tournament', tournamentSchema);

// ৩. রুটস
app.get('/api/tournaments', async (req, res) => {
    try {
        const list = await Tournament.find();
        res.json(list);
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

app.post('/admin/add', async (req, res) => {
    const newTourny = new Tournament(req.body);
    await newTourny.save();
    res.redirect('/admin.html');
});

app.post('/join-tournament', async (req, res) => {
    const { email, tId } = req.body;
    
    try {
        const tourny = await Tournament.findById(tId);
        if(!tourny) return res.send("Tournament not found!");

        // ইমেইল ট্রান্সপোর্টার
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'isihab33@gmail.com', 
                pass: 'etni qoul tmhc csrh' // নিশ্চিত করুন এটি ১৬ ডিজিটের 'App Password'
            }
        });

        let info = await transporter.sendMail({
            from: '"FF Tournament Admin" <isihab33@gmail.com>', // নিজের মেইল দিন
            to: email,
            subject: `Room Details: ${tourny.title}`,
            html: `<h3>Congrats! You are registered.</h3>
                   <p><b>Room ID:</b> ${tourny.roomID}</p>
                   <p><b>Password:</b> ${tourny.roomPass}</p>
                   <p>Be ready on time!</p>`
        });

        res.send("<script>alert('Success! Check your email.'); window.location='/';</script>");
    } catch (err) {
        res.status(500).send("Error: " + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
